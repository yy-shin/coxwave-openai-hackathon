/**
 * API functions for video generation
 */

import type {
  VideoGenerations,
  VideoProjectStateForPost,
  Storyboard,
  Clip,
  VeoClip,
  BackendSegmentForPost,
  BackendGenerationInputForPost,
  VideoCandidate,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Transform frontend Storyboard to backend VideoProjectState format
 */
export function transformStoryboardToVideoProjectState(
  storyboard: Storyboard,
  options?: {
    title?: string;
    aspectRatio?: string;
  }
): VideoProjectStateForPost {
  const segments: BackendSegmentForPost[] = storyboard.clips.map((clip) => {
    const generationInput = transformClipToGenerationInput(clip);

    return {
      scene_description: clip.scene_description,
      duration: clip.duration,
      generation_inputs: [generationInput],
    };
  });

  return {
    title: options?.title ?? "Untitled Project",
    description: storyboard.description,
    aspect_ratio: options?.aspectRatio ?? "9:16",
    total_duration: storyboard.total_duration,
    storyboard: {
      segments,
    },
    storyboard_approved: true,
  };
}

/**
 * Transform a single Clip to backend GenerationInput format
 */
function transformClipToGenerationInput(clip: Clip): BackendGenerationInputForPost {
  const baseInput: BackendGenerationInputForPost = {
    provider: clip.provider,
    prompt: clip.prompt,
    input_image: clip.input_image?.url
      ? { url: clip.input_image.url }
      : clip.input_image?.base64
        ? { url: clip.input_image.base64 }
        : null,
  };

  if (clip.provider === "veo") {
    const veoClip = clip as VeoClip;
    return {
      ...baseInput,
      negative_prompt: veoClip.negative_prompt ?? null,
      reference_images: veoClip.reference_images
        ?.filter((img) => img.url || img.base64)
        .map((img) => ({ url: img.url ?? img.base64! })) ?? null,
    };
  }

  return baseInput;
}

/**
 * Submit video generation request
 */
export async function submitVideoGeneration(
  state: VideoProjectStateForPost
): Promise<VideoGenerations> {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to submit video generation: ${error}`);
  }

  return response.json();
}

/**
 * Poll for video generation status
 */
export async function pollGenerationStatus(
  generations: VideoGenerations
): Promise<VideoGenerations> {
  const response = await fetch(`${API_BASE_URL}/generate/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(generations),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to poll generation status: ${error}`);
  }

  return response.json();
}

/**
 * Poll until all videos are completed or failed
 */
export async function pollUntilComplete(
  generations: VideoGenerations,
  options?: {
    pollInterval?: number;
    maxAttempts?: number;
    onProgress?: (generations: VideoGenerations) => void;
  }
): Promise<VideoGenerations> {
  const pollInterval = options?.pollInterval ?? 3000;
  const maxAttempts = options?.maxAttempts ?? 200; // ~10 minutes with 3s interval

  let current = generations;
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (current.status === "completed" || current.status === "failed") {
      return current;
    }

    await sleep(pollInterval);
    current = await pollGenerationStatus(current);
    attempts++;

    options?.onProgress?.(current);
  }

  throw new Error("Video generation timed out");
}

/**
 * Convert VideoGenerations to VideoCandidate array for display
 */
export function convertToVideoCandidates(
  generations: VideoGenerations
): VideoCandidate[] {
  const candidates: VideoCandidate[] = [];
  const projectId = generations.project_id;

  for (const segment of generations.segments) {
    for (const result of segment.generation_results) {
      // Construct local video URL using the backend endpoint
      const localVideoUrl = `/videos/${projectId}/${segment.segment_index}/${result.input_index}/${result.video.id}`;

      candidates.push({
        id: result.video.id,
        clipIndex: segment.segment_index,
        url: result.video.status === "completed" ? localVideoUrl : "",
        thumbnailUrl: result.video.thumbnail_url,
        model: result.provider,
        status:
          result.video.status === "queued"
            ? "pending"
            : result.video.status === "in_progress"
              ? "generating"
              : result.video.status,
        projectId,
        inputIndex: result.input_index,
      });
    }
  }

  return candidates;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Video segment info for merging
 */
export type VideoSegmentInfo = {
  project_id: string;
  segment_index: number;
  input_index: number;
  video_id: string;
};

/**
 * Merge multiple video segments into a single video
 */
export async function mergeVideos(
  videos: VideoSegmentInfo[]
): Promise<{ url: string; output_id: string }> {
  const response = await fetch(`${API_BASE_URL}/merge-videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videos }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to merge videos: ${error}`);
  }

  return response.json();
}
