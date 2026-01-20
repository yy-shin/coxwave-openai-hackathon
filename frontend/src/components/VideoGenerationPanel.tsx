import clsx from "clsx";
import { useState } from "react";

import { useAppStore } from "../store/useAppStore";
import type { VideoCandidate } from "../types";
import { MOCK_CLIPS, MOCK_VIDEO_CANDIDATES } from "../lib/mockData";
import { t, type Language } from "../lib/i18n";
import {
  Button,
  PanelLayout,
  PanelHeader,
  PanelContent,
  PanelFooter,
  Spinner,
  StatusDot,
} from "./ui";

type VideoGenerationPanelProps = {
  className?: string;
};

export function VideoGenerationPanel({ className }: VideoGenerationPanelProps) {
  const setRightPanel = useAppStore((state) => state.setRightPanel);
  const selectedVideoIds = useAppStore((state) => state.selectedVideoIds);
  const selectVideo = useAppStore((state) => state.selectVideo);
  const language = useAppStore((state) => state.language);
  const i18n = t(language);

  const [activeClipIndex, setActiveClipIndex] = useState<number>(0);

  const currentCandidates = MOCK_VIDEO_CANDIDATES.filter(
    (c) => c.clipIndex === activeClipIndex
  );

  const selectedVideoId = selectedVideoIds[activeClipIndex];
  const selectedVideo =
    currentCandidates.find((c) => c.id === selectedVideoId) ??
    currentCandidates[0];

  return (
    <PanelLayout className={className}>
      <PanelHeader
        title={i18n.videoGeneration}
        description={i18n.videoGenerationDesc}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanel("storyboard")}
          >
            {i18n.backToStoryboard}
          </Button>
        }
      />

      {/* 클립 탭 */}
      <ClipTabs
        clips={MOCK_CLIPS}
        activeIndex={activeClipIndex}
        selectedVideoIds={selectedVideoIds}
        onSelect={setActiveClipIndex}
      />

      <PanelContent className="flex flex-col gap-4">
        {/* 비디오 미리보기 */}
        <VideoPreview video={selectedVideo} language={language} />

        {/* 비디오 후보 목록 */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {i18n.generatedVideos(currentCandidates.length)}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentCandidates.map((candidate) => (
              <VideoThumbnail
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedVideo?.id === candidate.id}
                onSelect={() => selectVideo(activeClipIndex, candidate.id)}
              />
            ))}
          </div>
        </div>
      </PanelContent>

      <PanelFooter className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {i18n.clipSelectionStatus(Object.keys(selectedVideoIds).length, MOCK_CLIPS.length)}
        </p>
        <Button onClick={() => setRightPanel("final")}>
          {i18n.createFinalVideo}
        </Button>
      </PanelFooter>
    </PanelLayout>
  );
}

// ============================================
// Sub-components
// ============================================

type ClipTabsProps = {
  clips: typeof MOCK_CLIPS;
  activeIndex: number;
  selectedVideoIds: Record<number, string>;
  onSelect: (index: number) => void;
};

function ClipTabs({ clips, activeIndex, selectedVideoIds, onSelect }: ClipTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-slate-200/80 px-4 py-2 dark:border-slate-700/60">
      {clips.map((clip) => {
        const isActive = clip.index === activeIndex;
        const hasSelection = selectedVideoIds[clip.index] !== undefined;
        return (
          <button
            key={clip.index}
            onClick={() => onSelect(clip.index)}
            className={clsx(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs dark:bg-slate-600">
              {clip.index + 1}
            </span>
            <span className="hidden sm:inline">{clip.scene_description}</span>
            {hasSelection && (
              <span className="h-2 w-2 rounded-full bg-green-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

type VideoPreviewProps = {
  video: VideoCandidate | undefined;
  language: Language;
};

function VideoPreview({ video, language }: VideoPreviewProps) {
  const i18n = t(language);

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
          <CheckIcon />
        </div>
      )}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
