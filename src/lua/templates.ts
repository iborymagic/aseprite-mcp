import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureSafePath } from "../aseprite/path.js";
import { AsepriteCommandResult, runAsepriteCommand } from "../aseprite/cli.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface LuaTemplateMeta {
  id: string;
  description: string;
  params: string[];
  optionalParams?: string[];
  scriptPath: string;
}

export const LUA_TEMPLATES: LuaTemplateMeta[] = [
  {
    id: "remove_layer_by_name",
    description: "Removes a layer with a given name and saves to a new file (or overwrites).",
    params: ["inputFile", "layerName"],
    optionalParams: ["saveOutput"],
    scriptPath: path.join(__dirname, "templates", "remove_layer_by_name.lua")
  },
  {
    id: "export_tag_frames",
    description: "Exports only the frames of a specific tag as PNG images.",
    params: ["inputFile", "tag", "outputDir"],
    optionalParams: ["filenamePrefix"],
    scriptPath: path.join(__dirname, "templates", "export_tag_frames.lua")
  },
  {
    id: "recolor_palette",
    description: "Recolors the palette based on a mapping of from->to colors.",
    params: ["inputFile", "saveOutput", "mapping"],
    optionalParams: [],
    scriptPath: path.join(__dirname, "templates", "recolor_palette.lua")
  },
  {
    id: "normalize_animation_speed",
    description: "Normalizes all frame durations to a single target duration (in seconds).",
    params: ["inputFile", "saveOutput", "targetDuration"],
    optionalParams: [],
    scriptPath: path.join(__dirname, "templates", "normalize_animation_speed.lua")
  }
];

export function findLuaTemplate(id: string): LuaTemplateMeta | undefined {
  return LUA_TEMPLATES.find(t => t.id === id);
}

export async function runLuaScript(
  scriptPath: string,
  params: Record<string, unknown>
): Promise<AsepriteCommandResult> {
  const args = ["--batch"];

  if (typeof params.inputFile === "string") {
    const inputAbs = ensureSafePath(params.inputFile, { mustExist: true });
    args.push(`"${inputAbs}"`);
  }

  args.push("--script", `"${scriptPath}"`);

  for (const [key, value] of Object.entries(params)) {
    if (key === "inputFile" || value == null) continue;
    args.push("--script-param", `${key}=${value}`);
  }

  return runAsepriteCommand(args);
}