#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolHandlers as createAsepriteToolHandlers, createToolSchemas as createAsepriteToolSchemas } from "./aseprite/tools.js";
import { createToolHandlers as createLuaToolHandlers, createToolSchemas as createLuaToolSchemas } from "./lua/tools.js";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

let version: string | undefined;

try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  version = packageJson.version;
} catch (error) {
  console.error("Failed to read package.json:", error);
}

const server = new McpServer({
  name: "aseprite-mcp",
  version: version ?? "unknown"
});

const asepriteToolSchemas = createAsepriteToolSchemas();
const luaToolSchemas = createLuaToolSchemas();

const asepriteToolHandlers = createAsepriteToolHandlers();
const luaToolHandlers = createLuaToolHandlers();

server.registerTool(
  "aseprite_check_environment",
  { description: "Check the environment of Aseprite" },
  asepriteToolHandlers.aseprite_check_environment
);

server.registerTool(
  "aseprite_export_sheet",
  {
    description: "Export Aseprite file to sprite sheet image",
    inputSchema: asepriteToolSchemas.aseprite_export_sheet,
  },
  asepriteToolHandlers.aseprite_export_sheet
);

server.registerTool(
  "aseprite_export_frames",
  {
    description: "Export each frame of Aseprite file",
    inputSchema: asepriteToolSchemas.aseprite_export_frames,
  },
  asepriteToolHandlers.aseprite_export_frames
);

server.registerTool(
  "aseprite_export_metadata",
  {
    description: "Export metadata json from Aseprite file",
    inputSchema: asepriteToolSchemas.aseprite_export_metadata,
  },
  asepriteToolHandlers.aseprite_export_metadata
);

server.registerTool(
  "aseprite_list_lua_templates",
  { description: "List available Aseprite Lua templates." },
  luaToolHandlers.aseprite_list_lua_templates
);

server.registerTool(
  "auto_crop_transparent",
  {
    description: "Automatically crops empty transparent borders of the sprite",
    inputSchema: luaToolSchemas.auto_crop_transparent,
  },
  luaToolHandlers.auto_crop_transparent
);

server.registerTool(
  "merge_visible_layers",
  {
    description: "Merges all currently visible layers into a single layer",
    inputSchema: luaToolSchemas.merge_visible_layers,
  },
  luaToolHandlers.merge_visible_layers
);

server.registerTool(
  "normalize_animation_speed",
  {
    description: "Normalizes all frame durations to a single target duration (in seconds)",
    inputSchema: luaToolSchemas.normalize_animation_speed,
  },
  luaToolHandlers.normalize_animation_speed
);

server.registerTool(
  "recolor_palette",
  {
    description: "Recolors the palette based on a mapping of from->to colors",
    inputSchema: luaToolSchemas.recolor_palette,
  },
  luaToolHandlers.recolor_palette
);

server.registerTool(
  "remove_layer_by_name",
  {
    description: "Removes a layer with a given name and saves to a new file (or overwrites)",
    inputSchema: luaToolSchemas.remove_layer_by_name,
  },
  luaToolHandlers.remove_layer_by_name
);

server.registerTool(
  "export_layer_only",
  {
    description: "Exports only the specified layer to a flattened PNG",
    inputSchema: luaToolSchemas.export_layer_only,
  },
  luaToolHandlers.export_layer_only
);

server.registerTool(
  "export_tag_frames",
  {
    description: "Exports frames inside a specific animation tag to PNG files",
    inputSchema: luaToolSchemas.export_tag_frames,
  },
  luaToolHandlers.export_tag_frames
);

server.registerTool(
  "get_is_layer_exists",
  {
    description: "Checks if a layer exists in the active sprite",
    inputSchema: luaToolSchemas.get_is_layer_exists,
  },
  luaToolHandlers.get_is_layer_exists
);

server.registerTool(
  "get_is_tag_exists",
  {
    description: "Checks if a tag exists in the active sprite",
    inputSchema: luaToolSchemas.get_is_tag_exists,
  },
  luaToolHandlers.get_is_tag_exists
);

server.registerTool(
  "get_palette_info",
  { 
    description: "Gets information about the palette of the active sprite", 
    inputSchema: luaToolSchemas.get_palette_info,
  },
  luaToolHandlers.get_palette_info
);

server.registerTool(
  "get_selection_bounds",
  { 
    description: "Gets the bounds of the selection in the active sprite", 
    inputSchema: luaToolSchemas.get_selection_bounds,
  },
  luaToolHandlers.get_selection_bounds
);

server.registerTool(
  "get_tag_list",
  { 
    description: "Gets a list of all tags in the active sprite", 
    inputSchema: luaToolSchemas.get_tag_list,
  },
  luaToolHandlers.get_tag_list
);

server.registerTool(
  "get_layer_list",
  { 
    description: "Gets a list of all layers in the active sprite", 
    inputSchema: luaToolSchemas.get_layer_list,
  },
  luaToolHandlers.get_layer_list
);

server.registerTool(
  "get_frame_info",
  { 
    description: "Gets information about the current frame", 
    inputSchema: luaToolSchemas.get_frame_info,
  },
  luaToolHandlers.get_frame_info
);

server.registerTool(
  "get_active_sprite_info",
  { 
    description: "Gets information about the active sprite", 
    inputSchema: luaToolSchemas.get_active_sprite_info,
  },
  luaToolHandlers.get_active_sprite_info
);

server.registerTool(
  "aseprite_run_lua_script",
  {
    description: "Run a raw Lua script (advanced / unsafe).",
    inputSchema: luaToolSchemas.aseprite_run_lua_script,
  },
  luaToolHandlers.aseprite_run_lua_script
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Aseprite MCP server started");
}

main().catch(err => {
  console.error("MCP Error:", err);
  process.exit(1);
});
