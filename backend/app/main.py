"""FastAPI entrypoint wiring the ChatKit server and REST endpoints."""

from __future__ import annotations

from dotenv import load_dotenv

load_dotenv()

import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Any

from pydantic import BaseModel

from chatkit.server import StreamingResult
from chatkit.store import NotFoundError
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response, StreamingResponse
from starlette.responses import JSONResponse

from .server import VideoAssistantServer, create_chatkit_server
from .tools.video_generations import (
    VideoGenerations,
    generate_videos_from_project,
    get_video_local_path,
    poll_and_save_video_generations,
)
from .video_project_state import VideoProjectState

# Project root for storing generated videos
_PROJECT_ROOT = Path(__file__).parent.parent

app = FastAPI(title="OvenAI Video Generation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_chatkit_server: VideoAssistantServer | None = create_chatkit_server()


def get_chatkit_server() -> VideoAssistantServer:
    """Dependency to get the ChatKit server instance."""
    if _chatkit_server is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "ChatKit dependencies are missing. Install the ChatKit Python "
                "package to enable the conversational endpoint."
            ),
        )
    return _chatkit_server


@app.post("/chatkit")
async def chatkit_endpoint(
    request: Request, server: VideoAssistantServer = Depends(get_chatkit_server)
) -> Response:
    """ChatKit streaming endpoint for chat interactions."""
    payload = await request.body()
    result = await server.process(payload, {"request": request})
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    if hasattr(result, "json"):
        return Response(content=result.json, media_type="application/json")
    return JSONResponse(result)


@app.get("/projects/{thread_id}")
async def read_project_state(
    thread_id: str,
    server: VideoAssistantServer = Depends(get_chatkit_server),
) -> dict[str, Any]:
    """Get video project state for a thread."""
    state = await server.project_store.load(thread_id)
    return {"project": state.to_payload(thread_id)}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.put("/attachments/{attachment_id}/upload")
async def upload_attachment(
    attachment_id: str,
    request: Request,
    server: VideoAssistantServer = Depends(get_chatkit_server),
) -> dict[str, str]:
    """Upload attachment bytes for two-phase upload."""
    data = await request.body()
    if not data:
        raise HTTPException(status_code=400, detail="Empty upload body")
    attachment_store = server._get_attachment_store()
    try:
        await attachment_store.save_upload(attachment_id, data, {"request": request})
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "ok"}


@app.get("/attachments/{attachment_id}")
async def read_attachment(
    attachment_id: str,
    request: Request,
    server: VideoAssistantServer = Depends(get_chatkit_server),
) -> Response:
    """Serve uploaded attachments for UI previews."""
    try:
        attachment = await server.store.load_attachment(
            attachment_id, context={"request": request}
        )
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    path = (attachment.metadata or {}).get("path")
    if not path:
        raise HTTPException(status_code=404, detail="Attachment has no file path")
    return FileResponse(path, media_type=attachment.mime_type, filename=attachment.name)


@app.post("/generate")
async def submit_generation(state: VideoProjectState) -> VideoGenerations:
    """Submit a video generation request.

    Receives a VideoProjectState with a storyboard containing segments,
    and initiates video generation for each segment's generation inputs.

    Returns VideoGenerations with video IDs and initial status.
    """
    project_id = str(uuid.uuid4())
    return await generate_videos_from_project(project_id, state)


@app.post("/generate/status")
async def poll_generation_status(generations: VideoGenerations) -> VideoGenerations:
    """Poll for updated status of video generations.

    Receives a VideoGenerations object containing video IDs and providers,
    and returns an updated VideoGenerations with latest status/progress/URLs.
    Downloads completed videos to local storage.
    """
    return await poll_and_save_video_generations(generations, _PROJECT_ROOT)


@app.get("/videos/{project_id}/{segment_index}/{input_index}/{video_id}")
async def serve_video(
    project_id: str,
    segment_index: int,
    input_index: int,
    video_id: str,
) -> FileResponse:
    """Serve a generated video file."""
    file_path = get_video_local_path(
        _PROJECT_ROOT, project_id, segment_index, input_index, video_id
    )

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Video not found: {video_id}",
        )

    return FileResponse(file_path, media_type="video/mp4")


class VideoSegmentInfo(BaseModel):
    """Information to locate a video segment."""

    project_id: str
    segment_index: int
    input_index: int
    video_id: str


class MergeVideosRequest(BaseModel):
    """Request to merge multiple video segments into one."""

    videos: list[VideoSegmentInfo]


class MergeVideosResponse(BaseModel):
    """Response containing the merged video URL."""

    url: str
    output_id: str


@app.post("/merge-videos")
async def merge_videos(request: MergeVideosRequest) -> MergeVideosResponse:
    """Merge multiple video segments into a single video using FFmpeg."""
    if not request.videos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No videos provided",
        )

    # Collect video file paths
    video_paths: list[Path] = []
    for video_info in request.videos:
        file_path = get_video_local_path(
            _PROJECT_ROOT,
            video_info.project_id,
            video_info.segment_index,
            video_info.input_index,
            video_info.video_id,
        )
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Video not found: {video_info.video_id}",
            )
        video_paths.append(file_path)

    # Create output directory and file
    output_id = str(uuid.uuid4())
    output_dir = _PROJECT_ROOT / "data" / "merged_videos"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{output_id}.mp4"

    # Create concat file for FFmpeg
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        for video_path in video_paths:
            f.write(f"file '{video_path}'\n")
        concat_file = f.name

    try:
        # Run FFmpeg to concatenate videos
        result = subprocess.run(
            [
                "ffmpeg",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
                "-c", "copy",
                "-y",
                str(output_path),
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"FFmpeg error: {result.stderr}",
            )

    finally:
        # Clean up concat file
        Path(concat_file).unlink(missing_ok=True)

    return MergeVideosResponse(
        url=f"/merged-videos/{output_id}",
        output_id=output_id,
    )


@app.get("/merged-videos/{output_id}")
async def serve_merged_video(output_id: str) -> FileResponse:
    """Serve a merged video file."""
    file_path = _PROJECT_ROOT / "data" / "merged_videos" / f"{output_id}.mp4"

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Merged video not found: {output_id}",
        )

    return FileResponse(file_path, media_type="video/mp4")
