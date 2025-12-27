interface AsepriteFrame {
  duration: number;
}

interface AsepriteFrameTag {
  name: string;
  from: number;
  to: number;
  direction: string;
}

interface AsepriteMeta {
  size: { w: number; h: number };
  frameTags?: AsepriteFrameTag[];
}

export interface AsepriteJson {
  frames: Record<string, AsepriteFrame>;
  meta: AsepriteMeta;
}

export interface CharacterTagAnalysis {
  name: string;
  frames: number;
  from: number;
  to: number;
  durationPattern: number[];
  issues: string[];
}

interface CharacterAnalysisResult {
  file: string;
  sprite: {
    width: number;
    height: number;
    frames: number;
    colorMode?: string;
  };
  tags: CharacterTagAnalysis[];
  warnings: string[];
  recommendations: string[];
}

export function analyzeCharacterFromMetadata(
  inputFile: string,
  metaJson: AsepriteJson
): CharacterAnalysisResult {
  const framesArray = Object.values(metaJson.frames);
  const totalFrames = framesArray.length;

  const width = metaJson.meta.size?.w ?? 0;
  const height = metaJson.meta.size?.h ?? 0;

  const tags = metaJson.meta.frameTags ?? [];

  const tagAnalyses: CharacterTagAnalysis[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const recommendedTags = ["Idle", "Walk", "Attack"];

  for (const tag of tags) {
    const { name, from, to } = tag;
    const durationPattern: number[] = [];
    const issues: string[] = [];

    for (let i = from; i <= to; i++) {
      const frame = framesArray[i];
      if (frame) {
        durationPattern.push(frame.duration);
      } else {
        issues.push(`missing_frame_index_${i}`);
      }
    }

    if (durationPattern.length > 1) {
      const first = durationPattern[0];
      const inconsistent = durationPattern.some((duration) => duration !== first);
      if (inconsistent) {
        issues.push("duration_inconsistent");
      }
    }

    tagAnalyses.push({
      name,
      frames: to - from + 1,
      from,
      to,
      durationPattern,
      issues
    });
  }

  const existingTagNames = new Set(tags.map((tag) => tag.name));
  for (const tag of recommendedTags) {
    const exists = Array.from(existingTagNames).some(
      (tagName) => tagName.toLowerCase() === tag.toLowerCase()
    );
    if (!exists) {
      warnings.push(`Missing recommended animation tag: ${tag}`);
    }
  }

  if (tags.length === 0) {
    warnings.push("No frame tags found. Consider defining Idle/Walk/Attack tags.");
    recommendations.push("Define basic animation tags like Idle, Walk, and Attack.");
  }

  if (tagAnalyses.some((tagAnalysis) => tagAnalysis.issues.includes("duration_inconsistent"))) {
    warnings.push("Some tags have inconsistent frame durations.");
    recommendations.push("Normalize frame durations for smoother animations.");
  }

  return {
    file: inputFile,
    sprite: {
      width,
      height,
      frames: totalFrames
    },
    tags: tagAnalyses,
    warnings,
    recommendations
  };
}