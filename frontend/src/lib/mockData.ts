import type { Storyboard, VideoCandidate } from "../types";

// Example storyboard for testing
export const EXAMPLE_STORYBOARD: Storyboard = {
  description:
    "A high-energy game marketing video showcasing Cookie Run character transformation. Appeals to casual mobile gamers aged 18-35 through vibrant colors, dynamic action sequences, and character progression fantasy. Style: 2D animated with cel-shading effects.",
  total_duration: 24,
  clips: [
    {
      scene_description: "Opening shot: Cookie character appears in a magical forest",
      provider: "veo",
      prompt:
        "A cute 2D animated cookie character with big eyes stands in a colorful magical forest, sunlight filtering through trees, whimsical atmosphere, smooth animation, vibrant colors",
      duration: 8,
      negative_prompt: "blurry, low quality, distorted, realistic",
      reference_images: [{ url: "https://example.com/cookie_character.png" }],
    },
    {
      scene_description: "Transformation: Cookie gains superpowers with glowing effects",
      provider: "veo",
      prompt:
        "The cookie character begins glowing with golden energy, magical transformation sequence, swirling particles, dynamic camera movement, epic power-up moment, 2D animated style",
      duration: 8,
      negative_prompt: "blurry, distorted",
      input_image: { url: "https://example.com/transformation_start.png" },
    },
    {
      scene_description: "Finale: Superhero cookie in action pose with logo reveal",
      provider: "sora",
      prompt:
        "Superhero cookie character in heroic pose, cape flowing, magical energy surrounding them, camera pulls back to reveal Cookie Run logo, celebratory particle effects, 2D animated style",
      duration: 8,
    },
  ],
};

// Mock clips for VideoGenerationPanel
export const MOCK_CLIPS = [
  { index: 0, scene_description: "Opening shot: Cookie character appears" },
  { index: 1, scene_description: "Transformation: Cookie gains superpowers" },
  { index: 2, scene_description: "Finale: Superhero cookie with logo reveal" },
];

// Mock video candidates for VideoGenerationPanel
export const MOCK_VIDEO_CANDIDATES: VideoCandidate[] = [
  {
    id: "vid_0_1",
    clipIndex: 0,
    url: "/videos/clip0_veo.mp4",
    model: "Veo",
    status: "completed",
  },
  {
    id: "vid_0_2",
    clipIndex: 0,
    url: "/videos/clip0_sora.mp4",
    model: "Sora",
    status: "completed",
  },
  {
    id: "vid_1_1",
    clipIndex: 1,
    url: "/videos/clip1_veo.mp4",
    model: "Veo",
    status: "completed",
  },
  {
    id: "vid_1_2",
    clipIndex: 1,
    url: "/videos/clip1_sora.mp4",
    model: "Sora",
    status: "generating",
  },
  {
    id: "vid_2_1",
    clipIndex: 2,
    url: "/videos/clip2_sora.mp4",
    model: "Sora",
    status: "completed",
  },
];
