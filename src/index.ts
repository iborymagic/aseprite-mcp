#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolHandlers as createAsepriteToolHandlers, createToolSchemas as createAsepriteToolSchemas } from "./aseprite/tools.js";
import { createToolHandlers as createLuaToolHandlers, createToolSchemas as createLuaToolSchemas } from "./lua/tools.js";

const server = new McpServer({
  name: "aseprite-mcp",
  version: "0.1.0"
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
  "aseprite_run_lua_template",
  {
    description: "Run a predefined Aseprite Lua template with parameters.",
    inputSchema: luaToolSchemas.aseprite_run_lua_template,
  },
  luaToolHandlers.aseprite_run_lua_template
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
}

main().catch(err => {
  console.error("MCP Error:", err);
  process.exit(1);
});
