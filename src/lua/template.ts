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
    id: "get_is_layer_exists",
    description: "Checks if a layer exists in the active sprite",
    params: ["layerName"],
    scriptPath: path.join(__dirname, "templates", "get_is_layer_exists.lua")
  },
  {
    id: "get_is_tag_exists",
    description: "Checks if a tag exists in the active sprite",
    params: ["tagName"],
    scriptPath: path.join(__dirname, "templates", "get_is_tag_exists.lua")
  },
  {
    id: "get_palette_info",
    description: "Gets information about the palette of the active sprite",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_palette_info.lua")
  },
  {
    id: "get_selection_bounds",
    description: "Gets the bounds of the selection in the active sprite",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_selection_bounds.lua")
  },
  {
    id: "get_tag_list",
    description: "Gets a list of all tags in the active sprite",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_tag_list.lua")
  },
  {
    id: "get_layer_list",
    description: "Gets a list of all layers in the active sprite",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_layer_list.lua")
  },
  {
    id: "get_frame_info",
    description: "Gets information about the current frame",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_frame_info.lua")
  },
  {
    id: "get_active_sprite_info",
    description: "Gets information about the active sprite",
    params: [],
    scriptPath: path.join(__dirname, "templates", "get_active_sprite_info.lua")
  }

];

export function findLuaTemplate(id: string): LuaTemplateMeta | undefined {
  return LUA_TEMPLATES.find(t => t.id === id);
}

