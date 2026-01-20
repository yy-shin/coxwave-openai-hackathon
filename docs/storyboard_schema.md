# Storyboard Video Generation Schema

> Schema for orchestrating multi-segment video generation for marketing ads.
> For the full video model specification with all parameters, see [video_model_spec.md](./video_model_spec.md).

## Overview

```
Storyboard
├── description      (vivid description including appeal type, considerations)
├── total_duration   (total video length in seconds)
└── clips[]          (oneOf: SoraClip | VeoClip)
    ├── SoraClip
    │   ├── scene_description  (human-readable, not for AI)
    │   ├── provider: "sora"
    │   ├── model: sora-2 | sora-2-pro
    │   ├── prompt
    │   ├── duration: 4 | 8 | 12
    │   └── input_image
    │
    └── VeoClip
        ├── scene_description  (human-readable, not for AI)
        ├── provider: "veo"
        ├── model: veo-3.1-*
        ├── prompt
        ├── duration: 4 | 6 | 8
        ├── input_image
        ├── negative_prompt
        ├── last_frame
        ├── reference_images
        └── num_outputs
```

## Hardcoded Defaults

| Parameter | Fixed Value | Notes |
|-----------|-------------|-------|
| `aspect_ratio` | 16:9 | Landscape format |
| `resolution` | 720p | Standard quality |
| `generate_audio` | true | Veo only, always enabled |
| `person_generation` | allow_all | Veo only, allow all people generation |

## Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Storyboard",
  "description": "Top-level container for multi-segment video advertisement generation",
  "type": "object",
  "required": ["description", "total_duration", "clips"],
  "properties": {
    "description": {
      "type": "string",
      "description": "Vivid description of the entire video (include appeal type, target audience, key considerations, visual style)"
    },
    "total_duration": {
      "type": "integer",
      "minimum": 1,
      "maximum": 60,
      "description": "Total video length in seconds"
    },
    "clips": {
      "type": "array",
      "items": {
        "oneOf": [
          { "$ref": "#/$defs/SoraClip" },
          { "$ref": "#/$defs/VeoClip" }
        ]
      },
      "minItems": 1,
      "description": "Ordered list of video clips that compose the final video"
    }
  },
  "$defs": {
    "SoraClip": {
      "type": "object",
      "description": "Video segment for Sora video generation API",
      "required": ["scene_description", "provider", "prompt"],
      "properties": {
        "scene_description": {
          "type": "string",
          "description": "Human-readable scene description for UI display (not sent to video AI models)"
        },
        "provider": {
          "const": "sora",
          "description": "Sora video generation API"
        },
        "model": {
          "type": "string",
          "enum": ["sora-2", "sora-2-pro"],
          "description": "Sora model identifier"
        },
        "prompt": {
          "type": "string",
          "maxLength": 4096,
          "description": "Text description of video content for AI model"
        },
        "duration": {
          "type": "integer",
          "enum": [4, 8, 12],
          "default": 4,
          "description": "Duration in seconds"
        },
        "input_image": {
          "$ref": "#/$defs/ImageInput",
          "description": "First frame / starting image"
        }
      }
    },
    "VeoClip": {
      "type": "object",
      "description": "Video segment for Veo video generation API",
      "required": ["scene_description", "provider", "prompt"],
      "properties": {
        "scene_description": {
          "type": "string",
          "description": "Human-readable scene description for UI display (not sent to video AI models)"
        },
        "provider": {
          "const": "veo",
          "description": "Veo video generation API"
        },
        "model": {
          "type": "string",
          "enum": ["veo-3.1-generate-001", "veo-3.1-fast-generate-001", "veo-3.1-generate-preview", "veo-3.1-fast-generate-preview"],
          "description": "Veo model identifier"
        },
        "prompt": {
          "type": "string",
          "maxLength": 4096,
          "description": "Text description of video content for AI model"
        },
        "duration": {
          "type": "integer",
          "enum": [4, 6, 8],
          "default": 8,
          "description": "Duration in seconds"
        },
        "input_image": {
          "$ref": "#/$defs/ImageInput",
          "description": "First frame / starting image"
        },
        "negative_prompt": {
          "type": "string",
          "description": "What NOT to include"
        },
        "last_frame": {
          "$ref": "#/$defs/ImageInput",
          "description": "Last frame for interpolation"
        },
        "reference_images": {
          "type": "array",
          "items": { "$ref": "#/$defs/ImageInput" },
          "maxItems": 3,
          "description": "Subject/character reference images"
        },
        "num_outputs": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4,
          "default": 1,
          "description": "Number of videos to generate per clip"
        }
      }
    },
    "ImageInput": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "format": "uri",
          "description": "URL to image file"
        },
        "base64": {
          "type": "string",
          "description": "Base64-encoded image data"
        },
        "mime_type": {
          "type": "string",
          "enum": ["image/jpeg", "image/png", "image/webp"],
          "description": "Image MIME type"
        }
      },
      "oneOf": [
        { "required": ["url"] },
        { "required": ["base64", "mime_type"] }
      ]
    }
  }
}
```

## Example Storyboard

### Cookie Run Marketing Video (30 seconds)

```json
{
  "description": "A high-energy game marketing video showcasing Cookie Run character transformation. Appeals to casual mobile gamers aged 18-35 through vibrant colors, dynamic action sequences, and character progression fantasy. Style: 2D animated with cel-shading effects.",
  "total_duration": 24,
  "clips": [
    {
      "scene_description": "Opening shot: Cookie character appears in a magical forest",
      "provider": "veo",
      "prompt": "A cute 2D animated cookie character with big eyes stands in a colorful magical forest, sunlight filtering through trees, whimsical atmosphere, smooth animation, vibrant colors",
      "negative_prompt": "blurry, low quality, distorted, realistic",
      "duration": 8,
      "reference_images": [
        { "url": "https://example.com/cookie_character.png" }
      ]
    },
    {
      "scene_description": "Transformation: Cookie gains superpowers with glowing effects",
      "provider": "veo",
      "prompt": "The cookie character begins glowing with golden energy, magical transformation sequence, swirling particles, dynamic camera movement, epic power-up moment, 2D animated style",
      "negative_prompt": "blurry, distorted",
      "duration": 8,
      "input_image": {
        "url": "https://example.com/transformation_start.png"
      }
    },
    {
      "scene_description": "Finale: Superhero cookie in action pose with logo reveal",
      "provider": "sora",
      "prompt": "Superhero cookie character in heroic pose, cape flowing, magical energy surrounding them, camera pulls back to reveal Cookie Run logo, celebratory particle effects, 2D animated style",
      "duration": 8
    }
  ]
}
```

## Parameter Summary

### Storyboard (Top-Level)

| Parameter | Required | Description |
|-----------|----------|-------------|
| `description` | Yes | Vivid description of entire video concept |
| `total_duration` | Yes | Total length in seconds (1-60) |
| `clips` | Yes | Array of SoraClip or VeoClip objects |

### SoraClip

| Parameter | Required | Description |
|-----------|----------|-------------|
| `scene_description` | Yes | Human-readable scene description (UI only) |
| `provider` | Yes | Must be `"sora"` |
| `prompt` | Yes | Text description for AI model |
| `model` | No | `sora-2` or `sora-2-pro` |
| `duration` | No | 4, 8, or 12 seconds (default: 4) |
| `input_image` | No | First frame image |

### VeoClip

| Parameter | Required | Description |
|-----------|----------|-------------|
| `scene_description` | Yes | Human-readable scene description (UI only) |
| `provider` | Yes | Must be `"veo"` |
| `prompt` | Yes | Text description for AI model |
| `model` | No | `veo-3.1-generate-001`, `veo-3.1-fast-generate-001`, etc. |
| `duration` | No | 4, 6, or 8 seconds (default: 8) |
| `input_image` | No | First frame image |
| `negative_prompt` | No | What NOT to include |
| `last_frame` | No | Last frame for interpolation |
| `reference_images` | No | Up to 3 subject reference images |
| `num_outputs` | No | 1-4 videos (default: 1) |
