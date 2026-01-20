import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

import { useAppStore } from "../store/useAppStore";
import { t } from "../lib/i18n";
import {
  Button,
  PanelLayout,
  PanelHeader,
  PanelContent,
  PanelFooter,
} from "./ui";

type FinalVideoPanelProps = {
  className?: string;
};

export function FinalVideoPanel({ className }: FinalVideoPanelProps) {
  const setRightPanel = useAppStore((state) => state.setRightPanel);
  const language = useAppStore((state) => state.language);
  const i18n = t(language);
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    if (hasTriggeredConfetti.current) return;
    hasTriggeredConfetti.current = true;

    // 폭죽 효과
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        zIndex: 1000,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        zIndex: 1000,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <PanelLayout className={className}>
      <PanelHeader
        title={i18n.finalVideo}
        description={i18n.finalVideoDesc}
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanel("video")}
          >
            {i18n.backToSceneSelection}
          </Button>
        }
      />

      <PanelContent className="flex flex-col items-center justify-center">
        {/* 비디오 플레이어 */}
        <div className="flex w-full justify-center">
          <div className="relative h-[480px] w-[270px] overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
            {/* TODO: 실제 합쳐진 비디오로 교체 */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                  <PlayIcon />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  {i18n.videoReady}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {i18n.pressPlayToWatch}
                </p>
              </div>
            </div>
          </div>
        </div>
      </PanelContent>

      <PanelFooter className="flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={() => setRightPanel("storyboard")}>
          <RefreshIcon className="h-4 w-4" />
          {i18n.createAgain}
        </Button>
        <Button>
          <DownloadIcon className="h-4 w-4" />
          {i18n.download}
        </Button>
      </PanelFooter>
    </PanelLayout>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-7 w-7 text-slate-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
