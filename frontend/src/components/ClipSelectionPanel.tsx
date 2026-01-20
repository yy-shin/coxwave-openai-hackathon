import clsx from "clsx";
import { useState } from "react";

import { useAppStore } from "../store/useAppStore";
import type { VideoCandidate, Translations } from "../types";
import { t } from "../lib/i18n";
import {
  Button,
  PanelLayout,
  PanelContent,
  PanelFooter,
  Spinner,
  StatusDot,
  LoadingState,
} from "./ui";

type ClipSelectionPanelProps = {
  className?: string;
};

export function ClipSelectionPanel({ className }: ClipSelectionPanelProps) {
  const setRightPanel = useAppStore((state) => state.setRightPanel);
  const selectedVideoIds = useAppStore((state) => state.selectedVideoIds);
  const isCreatingFinalVideo = useAppStore((state) => state.isCreatingFinalVideo);
  const setIsCreatingFinalVideo = useAppStore((state) => state.setIsCreatingFinalVideo);
  const isGeneratingVideos = useAppStore((state) => state.isGeneratingVideos);
  const storyboard = useAppStore((state) => state.storyboard);
  const videoCandidates = useAppStore((state) => state.videoCandidates);
  const language = useAppStore((state) => state.language);
  const i18n = t(language);

  const clips = storyboard?.clips ?? [];
  const totalClips = clips.length;

  // Check if all clips have at least one completed video
  const allClipsHaveCompletedVideo = clips.every((_, idx) =>
    videoCandidates.some((c) => c.clipIndex === idx && c.status === "completed")
  );

  const handleCreateFinalVideo = async () => {
    setIsCreatingFinalVideo(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsCreatingFinalVideo(false);
    setRightPanel("final");
  };

  return (
    <PanelLayout className={className}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {i18n.clipSelection}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightPanel("storyboard")}
          disabled={isCreatingFinalVideo || isGeneratingVideos}
        >
          {i18n.backToStoryboard}
        </Button>
      </div>

      <PanelContent className="overflow-y-auto">
        {isCreatingFinalVideo ? (
          <LoadingState
            title={i18n.creatingFinalVideo}
            description={i18n.creatingFinalVideoDesc}
          />
        ) : totalClips === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {i18n.noVideosForClip}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Generation Progress Banner */}
            {isGeneratingVideos && (
              <GenerationProgressBanner
                videoCandidates={videoCandidates}
                totalClips={totalClips}
                i18n={i18n}
              />
            )}
            {clips.map((clip, index) => (
              <CollapsibleClipRow
                key={index}
                clipIndex={index}
                sceneDescription={clip.scene_description}
                duration={clip.duration}
                i18n={i18n}
              />
            ))}
          </div>
        )}
      </PanelContent>

      <PanelFooter className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isGeneratingVideos
            ? i18n.generatingVideosProgress ?? "Generating videos..."
            : i18n.clipSelectionStatus(Object.keys(selectedVideoIds).length, totalClips)}
        </p>
        <Button
          onClick={handleCreateFinalVideo}
          loading={isCreatingFinalVideo}
          disabled={!allClipsHaveCompletedVideo || isGeneratingVideos}
        >
          {isCreatingFinalVideo ? i18n.creating : i18n.createFinalVideo}
        </Button>
      </PanelFooter>
    </PanelLayout>
  );
}

// ============================================
// Generation Progress Banner
// ============================================

type GenerationProgressBannerProps = {
  videoCandidates: VideoCandidate[];
  totalClips: number;
  i18n: Translations;
};

function GenerationProgressBanner({ videoCandidates, totalClips, i18n }: GenerationProgressBannerProps) {
  // Count completed clips (clips that have at least one completed video)
  const completedClips = new Set(
    videoCandidates
      .filter((c) => c.status === "completed")
      .map((c) => c.clipIndex)
  ).size;

  const completedVideos = videoCandidates.filter((c) => c.status === "completed").length;
  const totalVideos = videoCandidates.length;
  const progressPercent = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          {/* Animated spinner ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500 dark:border-blue-700 dark:border-t-blue-400" />
          <VideoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {i18n.generatingVideos}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {completedClips}/{totalClips} {i18n.clipsCompleted} · {completedVideos}/{totalVideos} {i18n.videos}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            {Math.round(progressPercent)}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-blue-100 dark:bg-blue-900/50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Collapsible Clip Row
// ============================================

type CollapsibleClipRowProps = {
  clipIndex: number;
  sceneDescription: string;
  duration: number;
  i18n: Translations;
};

function CollapsibleClipRow({ clipIndex, sceneDescription, duration, i18n }: CollapsibleClipRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedVideoIds = useAppStore((state) => state.selectedVideoIds);
  const selectVideo = useAppStore((state) => state.selectVideo);
  const videoCandidates = useAppStore((state) => state.videoCandidates);
  const isGeneratingVideos = useAppStore((state) => state.isGeneratingVideos);

  const candidates = videoCandidates.filter((c) => c.clipIndex === clipIndex);
  const selectedVideoId = selectedVideoIds[clipIndex];
  const selectedVideo = selectedVideoId ? candidates.find((c) => c.id === selectedVideoId) : undefined;
  const hasSelection = selectedVideoId !== undefined;
  const isClipGenerating = candidates.some((c) => c.status === "generating" || c.status === "pending");
  const hasCompletedVideo = candidates.some((c) => c.status === "completed");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {/* Collapsed Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white dark:bg-slate-600">
          {clipIndex + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {sceneDescription || "씬 설명 없음"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isClipGenerating && (
            <span className="flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <Spinner size="xs" />
              {i18n.generating}
            </span>
          )}
          {hasSelection && !isClipGenerating && (
            <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckIcon className="h-3 w-3" />
              {i18n.selected}
            </span>
          )}
          {hasCompletedVideo && !hasSelection && !isClipGenerating && (
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {candidates.filter((c) => c.status === "completed").length} ready
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {duration}{i18n.seconds}
          </span>
          <ChevronIcon
            className={clsx(
              "h-4 w-4 text-slate-400 transition-transform dark:text-slate-500",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          {/* Selected Video Preview */}
          {selectedVideo ? (
            <VideoPreview video={selectedVideo} i18n={i18n} />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {i18n.selectVideoPrompt}
              </p>
            </div>
          )}

          {/* Video Candidates Grid */}
          <div className="mt-4">
            <h4 className="mb-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              {i18n.generatedVideos(candidates.length)}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {candidates.map((candidate) => (
                <VideoThumbnail
                  key={candidate.id}
                  candidate={candidate}
                  isSelected={selectedVideo?.id === candidate.id}
                  onSelect={() => selectVideo(clipIndex, candidate.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

type VideoPreviewProps = {
  video: VideoCandidate | undefined;
  i18n: Translations;
};

function VideoPreview({ video, i18n }: VideoPreviewProps) {
  if (!video) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <p className="text-slate-500 dark:text-slate-400">
          {i18n.noVideosForClip}
        </p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
      {video.status === "completed" ? (
        <video
          key={video.id}
          className="h-full w-full object-contain"
          controls
          autoPlay
          muted
          loop
        >
          <source src={video.url} type="video/mp4" />
          {i18n.videoNotPlayable}
        </video>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <Spinner size="md" className="mx-auto mb-3" />
            <p className="text-sm text-slate-400">{i18n.generatingWith(video.model)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

type VideoThumbnailProps = {
  candidate: VideoCandidate;
  isSelected: boolean;
  onSelect: () => void;
};

function VideoThumbnail({ candidate, isSelected, onSelect }: VideoThumbnailProps) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        "group relative aspect-video overflow-hidden rounded-lg border-2 transition-all",
        isSelected
          ? "border-slate-900 ring-2 ring-slate-300 dark:border-slate-100 dark:ring-slate-600"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
      )}
    >
      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700">
        {candidate.status === "completed" && (
          <video
            className="h-full w-full object-cover"
            src={candidate.url}
            muted
            preload="metadata"
          />
        )}
        {candidate.status === "generating" && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* 모델 라벨 */}
      <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
        <StatusDot status={candidate.status} />
        {candidate.model}
      </div>

      {/* 선택 체크마크 */}
      {isSelected && (
        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
          <CheckIcon className="h-3 w-3" />
        </div>
      )}
    </button>
  );
}

// ============================================
// Icons
// ============================================

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
    </svg>
  );
}
