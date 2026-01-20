import clsx from "clsx";

import { useAppStore } from "../store/useAppStore";
import type { Clip } from "../types";
import { t } from "../lib/i18n";
import {
  Button,
  PanelLayout,
  PanelHeader,
  PanelContent,
  PanelFooter,
  EmptyState,
  LoadingState,
  Badge,
  ProviderBadge,
} from "./ui";

type StoryboardPanelProps = {
  className?: string;
};

export function StoryboardPanel({ className }: StoryboardPanelProps) {
  const storyboard = useAppStore((state) => state.storyboard);
  const setRightPanel = useAppStore((state) => state.setRightPanel);
  const isGeneratingVideos = useAppStore((state) => state.isGeneratingVideos);
  const setIsGeneratingVideos = useAppStore(
    (state) => state.setIsGeneratingVideos
  );
  const language = useAppStore((state) => state.language);
  const i18n = t(language);

  const hasClips = storyboard && storyboard.clips.length > 0;
  // TODO: 실제 백엔드 연동 시 아래 줄로 복구
  // const canGenerate = !!storyboard;
  const canGenerate = true;

  const handleGenerateVideos = async () => {
    // TODO: 실제 백엔드 연동 시 아래 체크 복구
    // if (!storyboard) return;

    setIsGeneratingVideos(true);

    // TODO: 실제 백엔드 API 호출로 교체
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsGeneratingVideos(false);
    setRightPanel("video");
  };

  const description = storyboard
    ? i18n.totalDurationClips(storyboard.total_duration, storyboard.clips.length)
    : i18n.storyboardEmpty;

  return (
    <PanelLayout className={className}>
      <PanelHeader title={i18n.storyboard} description={description} />

      <PanelContent>
        {isGeneratingVideos ? (
          <LoadingState
            title={i18n.generatingVideos}
            description={i18n.generatingVideosDesc}
          />
        ) : hasClips ? (
          <div className="space-y-4">
            {storyboard.clips.map((clip, index) => (
              <ClipCard key={index} clip={clip} index={index} language={language} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<StoryboardIcon />}
            title={i18n.chatPrompt1}
            description={i18n.chatPrompt2}
          />
        )}
      </PanelContent>

      <PanelFooter className="flex justify-end">
        <Button
          onClick={handleGenerateVideos}
          disabled={!canGenerate}
          loading={isGeneratingVideos}
        >
          {isGeneratingVideos ? i18n.generating : i18n.generate}
        </Button>
      </PanelFooter>
    </PanelLayout>
  );
}

function StoryboardIcon() {
  return (
    <svg
      className="h-8 w-8 text-slate-400 dark:text-slate-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  );
}

type ClipCardProps = {
  clip: Clip;
  index: number;
  language: "ko" | "en";
};

function ClipCard({ clip, index, language }: ClipCardProps) {
  const i18n = t(language);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {index + 1}
        </div>

        <div className="flex-1">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            {clip.scene_description}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{clip.duration}{i18n.seconds}</Badge>
            <ProviderBadge provider={clip.provider} />
            {clip.model && <Badge variant="default">{clip.model}</Badge>}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
            {clip.prompt}
          </p>
        </div>
      </div>
    </div>
  );
}
