import type { Storyboard } from "../store/useAppStore";

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
      negative_prompt: "blurry, low quality, distorted, realistic",
      duration: 8,
      reference_images: [{ url: "https://example.com/cookie_character.png" }],
    },
    {
      scene_description: "Transformation: Cookie gains superpowers with glowing effects",
      provider: "veo",
      prompt:
        "The cookie character begins glowing with golden energy, magical transformation sequence, swirling particles, dynamic camera movement, epic power-up moment, 2D animated style",
      negative_prompt: "blurry, distorted",
      duration: 8,
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
