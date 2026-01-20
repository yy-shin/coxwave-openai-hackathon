import { StartScreenPrompt } from "@openai/chatkit";
import { DEFAULT_CAT_STATE } from "./cat";

export const CHATKIT_API_URL =
  import.meta.env.VITE_CHATKIT_API_URL ?? "/chatkit";

/**
 * ChatKit still expects a domain key at runtime. Use any placeholder locally,
 * but register your production domain at
 * https://platform.openai.com/settings/organization/security/domain-allowlist
 * and deploy the real key.
 */
export const CHATKIT_API_DOMAIN_KEY =
  import.meta.env.VITE_CHATKIT_API_DOMAIN_KEY ?? "domain_pk_localhost_dev";

export const CAT_STATE_API_URL =
  import.meta.env.VITE_CAT_STATE_API_URL ?? "/cats";

export const THEME_STORAGE_KEY = "soraad-theme";
export const LANG_STORAGE_KEY = "soraad-lang";

import type { Language } from "./i18n";

export const GREETING: Record<Language, string> = {
  ko: "어떤 영상을 구워드릴까요?",
  en: "What video would you like to bake?",
};

export const QUICK_START_PROMPT =
  "[QUICK_START] 예시 데이터로 빠른 스토리보드 생성";

export const STARTER_PROMPTS: Record<Language, StartScreenPrompt[]> = {
  ko: [
    {
      label: "빠른 시작 (데모)",
      prompt: QUICK_START_PROMPT,
      icon: "bolt",
    },
    {
      label: "게임 바이럴 광고",
      prompt:
        "쿠키런 캐릭터 '용감한 쿠키'를 의인화해서 20초 숏폼 바이럴 영상 만들어줘. 쿠키가 실사로 변신하는 장면 넣어줘.",
      icon: "sparkle",
    },
    {
      label: "제품 광고",
      prompt:
        "새로운 무선 이어폰 제품 광고 30초 만들어줘. 감각적인 언박싱 장면으로 시작해서 일상 사용 씬으로 연결해줘.",
      icon: "cube",
    },
    {
      label: "기업 소개 영상",
      prompt:
        "AI 스타트업 회사 소개 영상 30초 만들어줘. 미래적인 느낌으로 팀원들이 협업하는 장면과 기술 데모를 보여주고 싶어.",
      icon: "suitcase",
    },
  ],
  en: [
    {
      label: "Quick Start (Demo)",
      prompt: QUICK_START_PROMPT,
      icon: "bolt",
    },
    {
      label: "Game Viral Ad",
      prompt:
        "Create a 20-second viral video featuring Cookie Run's 'Brave Cookie' character transforming into a real person.",
      icon: "sparkle",
    },
    {
      label: "Product Ad",
      prompt:
        "Create a 30-second ad for new wireless earbuds. Start with a sleek unboxing scene and transition to everyday use.",
      icon: "cube",
    },
    {
      label: "Company Intro",
      prompt:
        "Create a 30-second intro video for an AI startup. Show team collaboration and tech demos with a futuristic feel.",
      icon: "suitcase",
    },
  ],
};

export const getPlaceholder = (lang: Language, _catName: string | null) => {
  return lang === "ko" ? "광고 제작 요청을 입력하세요" : "Enter your ad request";
};
