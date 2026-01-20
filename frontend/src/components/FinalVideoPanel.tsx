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

      <PanelContent className="flex flex-col items-center justify-center gap-6">
        {/* 비디오 플레이어 */}
        <div className="w-full max-w-2xl">
          <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
            {/* TODO: 실제 합쳐진 비디오로 교체 */}
            <div className="absolute inset-0 flex items-center justify-center pt-24">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
                  <PlayIcon />
                </div>
                <p className="text-lg font-medium text-slate-300">
                  {i18n.videoReady}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {i18n.pressPlayToWatch}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 완료 메시지 */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            {i18n.videoComplete}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {i18n.scenesJoined}
          </p>
        </div>
      </PanelContent>

      <PanelFooter className="flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={() => setRightPanel("storyboard")}>
          {i18n.createAgain}
        </Button>
        <Button>{i18n.download}</Button>
      </PanelFooter>
    </PanelLayout>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-10 w-10 text-slate-400"
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
