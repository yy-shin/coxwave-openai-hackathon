import { ChatKit, useChatKit } from "@openai/chatkit-react";
import clsx from "clsx";
import type { Widgets } from "@openai/chatkit";
import { useCallback, useRef } from "react";

import {
  CHATKIT_API_DOMAIN_KEY,
  CHATKIT_API_URL,
  GREETING,
  STARTER_PROMPTS,
  getPlaceholder,
} from "../lib/config";
import {
  transformStoryboardToVideoProjectState,
  submitVideoGeneration,
  pollGenerationStatus,
  convertToVideoCandidates,
} from "../lib/api";
import { EXAMPLE_STORYBOARD } from "../lib/exampleStoryboard";
import { useAppStore } from "../store/useAppStore";
import type { Storyboard, ProjectStatePayload, VideoGenerations } from "../types";
import { transformProjectStateToStoryboard } from "../types";

export type ChatKitInstance = ReturnType<typeof useChatKit>;

type ChatKitPanelProps = {
  onChatKitReady: (chatkit: ChatKitInstance) => void;
  className?: string;
};

export function ChatKitPanel({ onChatKitReady, className }: ChatKitPanelProps) {
  const chatkitRef = useRef<ChatKitInstance | null>(null);

  // Store selectors
  const theme = useAppStore((s) => s.scheme);
  const language = useAppStore((s) => s.language);
  const storyboard = useAppStore((s) => s.storyboard);
  const setFlashMessage = useAppStore((s) => s.setFlashMessage);
  const setThreadId = useAppStore((s) => s.setThreadId);
  const setStoryboard = useAppStore((s) => s.setStoryboard);
  const setRightPanel = useAppStore((s) => s.setRightPanel);
  const setVideoCandidates = useAppStore((s) => s.setVideoCandidates);
  const setIsGeneratingVideos = useAppStore((s) => s.setIsGeneratingVideos);

  // Helper to update storyboard and show panel
  const applyStoryboard = useCallback(
    (sb: Storyboard, flash?: string) => {
      setStoryboard(sb);
      setRightPanel("storyboard");
      if (flash) {
        setFlashMessage(flash);
      }
    },
    [setStoryboard, setRightPanel, setFlashMessage],
  );

  // Start video generation and poll for updates
  const startVideoGeneration = useCallback(
    async (sb: Storyboard) => {
      if (!sb) return;

      // 1. Switch to video panel and set generating state
      setRightPanel("video");
      setIsGeneratingVideos(true);

      try {
        // 2. Transform and submit generation request
        const videoProjectState = transformStoryboardToVideoProjectState(sb);
        let generations = await submitVideoGeneration(videoProjectState);

        // 3. Set initial candidates (all in generating state)
        setVideoCandidates(convertToVideoCandidates(generations));

        // 4. Poll until complete
        const maxAttempts = 200;
        let attempts = 0;

        while (attempts < maxAttempts) {
          if (generations.status === "completed" || generations.status === "failed") {
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
          generations = await pollGenerationStatus(generations);
          attempts++;

          // Update candidates with latest status
          setVideoCandidates(convertToVideoCandidates(generations));
        }

        // 5. Check for failures
        const failedCount = generations.segments.filter(
          (s) => s.status === "failed"
        ).length;

        if (failedCount > 0) {
          setFlashMessage(`${failedCount} video(s) failed to generate`);
        }
      } catch (error) {
        console.error("Video generation failed:", error);
        setFlashMessage("Video generation failed. Please try again.");
      } finally {
        setIsGeneratingVideos(false);
      }
    },
    [setRightPanel, setIsGeneratingVideos, setVideoCandidates, setFlashMessage],
  );

  // Handle widget actions (placeholder for future use)
  const handleWidgetAction = useCallback(
    async (
      action: { type: string; payload?: Record<string, unknown> },
      _widgetItem: { id: string; widget: Widgets.Card | Widgets.ListView },
    ) => {
      const chatkit = chatkitRef.current;
      if (!chatkit) return;

      // Add custom widget action handlers here as needed
      console.log("Widget action:", action.type, action.payload);
    },
    [],
  );

  // Handle client-side effects from backend
  const handleClientEffect = useCallback(
    ({ name, data }: { name: string; data: Record<string, unknown> }) => {
      switch (name) {
        case "update_project_status": {
          console.log(name, data);
          const projectState = data.state as ProjectStatePayload | undefined;
          if (projectState) {
            const storyboard = transformProjectStateToStoryboard(projectState);
            applyStoryboard(storyboard, data.flash as string | undefined);
          }
          break;
        }

        case "set_storyboard": {
          const storyboard = data.storyboard as Storyboard | undefined;
          if (storyboard) {
            applyStoryboard(storyboard);
          }
          break;
        }

        case "quick_start_demo": {
          applyStoryboard(EXAMPLE_STORYBOARD);
          break;
        }

        case "start_video_generation": {
          console.log(name, data);
          // Use storyboard from the event data if available, otherwise use current storyboard
          const projectState = data.state as ProjectStatePayload | undefined;
          const sb = projectState
            ? transformProjectStateToStoryboard(projectState)
            : storyboard;
          if (sb) {
            startVideoGeneration(sb);
          }
          break;
        }
      }
    },
    [applyStoryboard, storyboard, startVideoGeneration],
  );

  const chatkit = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      domainKey: CHATKIT_API_DOMAIN_KEY,
      uploadStrategy: { type: "two_phase" },
    },
    theme: {
      density: "spacious",
      colorScheme: theme,
      color: {
        grayscale: { hue: 220, tint: 6, shade: theme === "dark" ? -1 : -4 },
        accent: { primary: theme === "dark" ? "#f1f5f9" : "#0f172a", level: 1 },
      },
      radius: "round",
    },
    startScreen: {
      greeting: GREETING[language],
      prompts: STARTER_PROMPTS[language],
    },
    composer: {
      placeholder: getPlaceholder(language),
      attachments: {
        enabled: true,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
        maxCount: 10,
      },
    },
    threadItemActions: { feedback: false },
    widgets: { onAction: handleWidgetAction },
    onThreadChange: ({ threadId }) => setThreadId(threadId),
    onError: ({ error }) => console.error("ChatKit error", error),
    onReady: () => onChatKitReady?.(chatkit),
    onEffect: handleClientEffect,
  });
  chatkitRef.current = chatkit;

  return (
    <div className={clsx("relative h-full w-full overflow-hidden", className)}>
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}
