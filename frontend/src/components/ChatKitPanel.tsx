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
import { EXAMPLE_STORYBOARD } from "../lib/exampleStoryboard";
import { useAppStore } from "../store/useAppStore";
import type { Storyboard, ProjectStatePayload } from "../types";
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
  const setFlashMessage = useAppStore((s) => s.setFlashMessage);
  const setThreadId = useAppStore((s) => s.setThreadId);
  const setStoryboard = useAppStore((s) => s.setStoryboard);
  const setRightPanel = useAppStore((s) => s.setRightPanel);

  // Helper to update storyboard and show panel
  const applyStoryboard = useCallback(
    (storyboard: Storyboard, flash?: string) => {
      setStoryboard(storyboard);
      setRightPanel("storyboard");
      if (flash) {
        setFlashMessage(flash);
      }
    },
    [setStoryboard, setRightPanel, setFlashMessage],
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
      }
    },
    [applyStoryboard],
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
