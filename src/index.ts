#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolHandlers, createToolSchemas } from "./tools.js";

const server = new McpServer({
  name: "aseprite-mcp",
  version: "0.1.0"
});

const toolSchemas = createToolSchemas();
const toolHandlers = createToolHandlers();

server.registerTool(
  "aseprite_check_environment",
  {
    description: "Check the environment of Aseprite",
    inputSchema: undefined,
    outputSchema: undefined,
  },
  toolHandlers.aseprite_check_environment
);

server.registerTool(
  "aseprite_export_sheet",
  {
    description: "Export Aseprite file to sprite sheet image",
    inputSchema: toolSchemas.aseprite_export_sheet,
    outputSchema: toolSchemas.aseprite_output_result,
  },
  toolHandlers.aseprite_export_sheet
);

server.registerTool(
  "aseprite_export_frames",
  {
    description: "Export each frame of Aseprite file",
    inputSchema: toolSchemas.aseprite_export_frames,
    outputSchema: toolSchemas.aseprite_output_result,
  },
  toolHandlers.aseprite_export_frames
);

server.registerTool(
  "aseprite_export_metadata",
  {
    description: "Export metadata json from Aseprite file",
    inputSchema: toolSchemas.aseprite_export_metadata,
    outputSchema: toolSchemas.aseprite_output_result,
  },
  toolHandlers.aseprite_export_metadata
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Aseprite MCP server started");
}

main().catch(err => {
  console.error("MCP Error:", err);
  process.exit(1);
});
