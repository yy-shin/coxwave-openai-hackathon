import { create } from "zustand";

import { THEME_STORAGE_KEY, LANG_STORAGE_KEY } from "../lib/config";
import type { Language } from "../lib/i18n";

export type ColorScheme = "light" | "dark";
export type RightPanelType = "storyboard" | "video" | "final";

export type VideoCandidate = {
  id: string;
  clipIndex: number;
  url: string;
  thumbnailUrl?: string;
  model: string;
  status: "pending" | "generating" | "completed" | "failed";
};

export type ImageInput = {
  url?: string;
  base64?: string;
  mime_type?: "image/jpeg" | "image/png" | "image/webp";
};

export type BaseClip = {
  scene_description: string;
  prompt: string;
  duration: number;
  input_image?: ImageInput;
};

export type SoraClip = BaseClip & {
  provider: "sora";
  model?: "sora-2" | "sora-2-pro";
};

export type VeoClip = BaseClip & {
  provider: "veo";
  model?:
    | "veo-3.1-generate-001"
    | "veo-3.1-fast-generate-001"
    | "veo-3.1-generate-preview"
    | "veo-3.1-fast-generate-preview";
  negative_prompt?: string;
  last_frame?: ImageInput;
  reference_images?: ImageInput[];
  num_outputs?: number;
};

export type Clip = SoraClip | VeoClip;

export type Storyboard = {
  description: string;
  total_duration: number;
  clips: Clip[];
} | null;

type AppState = {
  // Theme & Language
  scheme: ColorScheme;
  setScheme: (scheme: ColorScheme) => void;
  language: Language;
  setLanguage: (language: Language) => void;

  // Thread
  threadId: string | null;
  setThreadId: (threadId: string | null) => void;

  // Flash messages
  flashMessage: string | null;
  setFlashMessage: (message: string | null) => void;

  // Right panel
  rightPanel: RightPanelType;
  setRightPanel: (panel: RightPanelType) => void;

  // Video generation
  videoCandidates: VideoCandidate[];
  setVideoCandidates: (candidates: VideoCandidate[]) => void;
  selectedVideoIds: Record<number, string>;
  selectVideo: (clipIndex: number, videoId: string) => void;

  // Storyboard
  storyboard: Storyboard;
  originalStoryboard: Storyboard;
  setStoryboard: (storyboard: Storyboard) => void;
  updateStoryboardDescription: (description: string) => void;
  updateClip: (clipIndex: number, updates: Partial<Clip>) => void;

  // Generation state
  isGeneratingVideos: boolean;
  setIsGeneratingVideos: (isGenerating: boolean) => void;
  isCreatingFinalVideo: boolean;
  setIsCreatingFinalVideo: (isCreating: boolean) => void;
};

const FLASH_TIMEOUT_MS = 10_000;

let flashTimer: ReturnType<typeof setTimeout> | null = null;

function clearFlashTimer() {
  if (flashTimer) {
    clearTimeout(flashTimer);
    flashTimer = null;
  }
}

function getInitialScheme(): ColorScheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ColorScheme | null;
  return stored === "light" || stored === "dark" ? stored : "light";
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "ko";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
  return stored === "ko" || stored === "en" ? stored : "ko";
}

function syncLanguageWithStorage(language: Language) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
  }
}

function syncSchemeWithDocument(scheme: ColorScheme) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", scheme === "dark");
  window.localStorage.setItem(THEME_STORAGE_KEY, scheme);
}

export const useAppStore = create<AppState>((set, get) => {
  const initialScheme = getInitialScheme();
  const initialLanguage = getInitialLanguage();
  syncSchemeWithDocument(initialScheme);

  return {
    // Theme & Language
    scheme: initialScheme,
    setScheme: (scheme) => {
      syncSchemeWithDocument(scheme);
      set({ scheme });
    },
    language: initialLanguage,
    setLanguage: (language) => {
      syncLanguageWithStorage(language);
      set({ language });
    },

    // Thread
    threadId: null,
    setThreadId: (threadId) => {
      const previousId = get().threadId;
      if (previousId === threadId) return;
      clearFlashTimer();
      set({ threadId, flashMessage: null });
    },

    // Flash messages
    flashMessage: null,
    setFlashMessage: (message) => {
      clearFlashTimer();
      if (!message) {
        set({ flashMessage: null });
        return;
      }
      set({ flashMessage: message });
      flashTimer = setTimeout(() => {
        set({ flashMessage: null });
        flashTimer = null;
      }, FLASH_TIMEOUT_MS);
    },

    // Right panel
    rightPanel: "storyboard",
    setRightPanel: (panel) => set({ rightPanel: panel }),

    // Video generation
    videoCandidates: [],
    setVideoCandidates: (candidates) => set({ videoCandidates: candidates }),
    selectedVideoIds: {},
    selectVideo: (clipIndex, videoId) =>
      set((state) => ({
        selectedVideoIds: { ...state.selectedVideoIds, [clipIndex]: videoId },
      })),

    // Storyboard - start with null (will be populated from backend)
    storyboard: null,
    originalStoryboard: null,
    setStoryboard: (storyboard) => set({ storyboard, originalStoryboard: storyboard }),
    updateStoryboardDescription: (description) =>
      set((state) => {
        if (!state.storyboard) return state;
        return { storyboard: { ...state.storyboard, description } };
      }),
    updateClip: (clipIndex, updates) =>
      set((state) => {
        if (!state.storyboard) return state;
        const newClips = [...state.storyboard.clips];
        newClips[clipIndex] = { ...newClips[clipIndex], ...updates } as Clip;
        return { storyboard: { ...state.storyboard, clips: newClips } };
      }),

    // Generation state
    isGeneratingVideos: false,
    setIsGeneratingVideos: (isGenerating) => set({ isGeneratingVideos: isGenerating }),
    isCreatingFinalVideo: false,
    setIsCreatingFinalVideo: (isCreating) => set({ isCreatingFinalVideo: isCreating }),
  };
});
