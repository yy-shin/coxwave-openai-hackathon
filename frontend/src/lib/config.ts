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

export const GREETING = "어떤 광고 영상을 만들어볼까요?";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
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
];

export const getPlaceholder = (_catName: string | null) => {
  return "광고 제작 요청을 입력하세요";
};