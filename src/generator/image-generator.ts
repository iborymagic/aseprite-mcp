import path from "node:path";
import fs from "node:fs/promises";
import axios from "axios";

export interface ImageGeneratorParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed?: number;
  stylePreset?: string;
  outputPath: string;
}

export interface ImageGeneratorResult {
  imagePath: string;
  seed?: number;
}

export interface ImageGenerator {
  generate(params: ImageGeneratorParams): Promise<ImageGeneratorResult>;
}

export class StubImageGenerator implements ImageGenerator {
  async generate(params: ImageGeneratorParams): Promise<ImageGeneratorResult> {
    throw new Error(
      `Image generator not configured. Tried to generate: "${params.prompt}" to ${params.outputPath}`
    );
  }
}

export class StableDiffusionWebuiGenerator implements ImageGenerator {
  constructor(private baseUrl: string) {}

  async generate(params: ImageGeneratorParams): Promise<ImageGeneratorResult> {
    const url = `${this.baseUrl}/sdapi/v1/txt2img`;

    const prompt =
      `${params.prompt}, ` +
      `pixel art, retro 16-bit, clean outline, sharp edges, high contrast, game sprite`;

    const negative =
      params.negativePrompt ??
      "photo, realistic, blurry, lowres, smear, oil painting";

    const body = {
      prompt,
      negative_prompt: negative,
      width: params.width,
      height: params.height,
      steps: 28,
      sampler_name: "DPM++ 2M",
      cfg_scale: 7,
      seed: params.seed ?? -1,
      restore_faces: false,
      tiling: false
    };

    const res = await axios.post(url, body, {
      timeout: 1000 * 60 * 3
    });

    if (!res.data?.images?.length) {
      throw new Error("Stable Diffusion returned no images");
    }

    const imgBase64 = res.data.images[0];
    const buffer = Buffer.from(imgBase64, "base64");

    const dir = path.dirname(params.outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(params.outputPath, buffer);

    let seed = params.seed;
    try {
      const info = JSON.parse(res.data.info ?? "{}");
      if (info.seed) seed = info.seed;
    } catch {}

    return {
      imagePath: params.outputPath,
      seed
    };
  }
}

