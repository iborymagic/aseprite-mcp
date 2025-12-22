import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveAsepritePath } from "./aseprite/env.js";
import { runAsepriteCommand } from "./aseprite/cli.js";

const server = new McpServer({
  name: "aseprite-mcp",
  version: "0.1.0"
});

server.registerTool(
  "aseprite_check_environment",
  {
    description: "Check the environment of Aseprite",
    inputSchema: undefined,
    outputSchema: undefined,
  },
  async () => {
    const asepritePath = await resolveAsepritePath();
    const { stdout } = await runAsepriteCommand(`"${asepritePath}" --version`);
    return {
      content: [
        {
          type: "text",
          text: [
            'Aseprite detected',
            `Aseprite path: ${asepritePath}`, 
            `Aseprite version: ${stdout.trim()}`
          ].join("\n")
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("MCP Error:", err);
  process.exit(1);
});
