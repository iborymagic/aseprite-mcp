import path from "node:path";
import { fileURLToPath } from "node:url";

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
    scriptPath: path.join(__dirname, "templates", "recolor_palette.lua")
  },
  {
    id: "normalize_animation_speed",
    description: "Normalizes all frame durations to a single target duration (in seconds).",
    params: ["inputFile", "saveOutput", "targetDuration"],
    scriptPath: path.join(__dirname, "templates", "normalize_animation_speed.lua")
  },
  {
    id: "auto_crop_transparent",
    description: "Automatically crops empty transparent borders of the sprite",
    params: ["inputFile", "saveOutput"],
    scriptPath: path.join(__dirname, "templates", "auto_crop_transparent.lua")
  },
  {
    id: "merge_visible_layers",
    description: "Merges currently visible layers and saves resulting flattened sprite",
    params: ["inputFile", "saveOutput"],
    scriptPath: path.join(__dirname, "templates", "merge_visible_layers.lua")
  },
  {
    id: "export_layer_only",
    description: "Exports only the specified layer to a flattened PNG",
    params: ["inputFile", "layerName", "outputDir"],
    scriptPath: path.join(__dirname, "templates", "export_layer_only.lua")
  },
  {
    id: "export_tag_frames",
    description: "Exports frames inside a specific animation tag to PNG files",
    params: ["inputFile", "tag", "outputDir"],
    optionalParams: ["filenamePrefix"],
    scriptPath: path.join(__dirname, "templates", "export_tag_frames.lua")
  },
  {
    id: "character_normalize",
    description: "Normalizes frame durations inside all tags to a single target duration (in seconds).",
    params: ["inputFile", "saveOutput", "targetMs"],
    optionalParams: ["autoCrop"],
    scriptPath: path.join(__dirname, "templates", "character_normalize.lua")
  },
  {
    id: "character_export",
    description: "Exports a character sprite",
    params: ["inputFile", "exportDir", "sheetType", "format"],
    scriptPath: path.join(__dirname, "templates", "character_export.lua")
  },
];

export function findLuaTemplate(id: string): LuaTemplateMeta | undefined {
  return LUA_TEMPLATES.find(t => t.id === id);
}

