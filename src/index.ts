import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveAsepritePath } from "./aseprite/env.js";
import { runAsepriteCommand } from "./aseprite/cli.js";
import z from "zod";
import { readFileSync } from "node:fs";

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
    const { stdout: version } = await runAsepriteCommand(["--version"]);
    return {
      content: [
        {
          type: "text",
          text: [
            'Aseprite detected',
            `Aseprite path: ${asepritePath}`, 
            `Aseprite version: ${version.trim()}`
          ].join("\n")
        }
      ]
    };
  }
);

server.registerTool(
  "aseprite_export_sheet",
  {
    description: "Export Aseprite file to sprite sheet image",
    inputSchema: z.object({
      inputFile: z.string(),
      outputSheet: z.string(),
      sheetType: z.enum(["rows", "columns", "packed"]).optional().default("packed"),
      dataFile: z.string().optional(),
      tag: z.string().optional(),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputSheet, sheetType, dataFile, tag }) => {
    const args: string[] = [
      "--batch",
      `"${inputFile}"`,
      "--sheet",
      `"${outputSheet}"`,
      "--sheet-type",
      sheetType
    ];

    if (tag) args.push("--tag", `"${tag}"`);
    if (dataFile) args.push("--data", `"${dataFile}"`);

    const result = await runAsepriteCommand(args);

    return {
      content: [
        {
          type: "text",
          text: [
            "Aseprite sheet exported",
            `command: ${result.command}`,
            result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
            result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
            `sheet: ${outputSheet}`,
            dataFile ? `data: ${dataFile}` : ""
          ]
            .filter(Boolean)
            .join("\n")
        }
      ]
    };
  }
);

server.registerTool(
  "aseprite_export_frames",
  {
    description: "Export each frame of Aseprite file",
    inputSchema: z.object({
      inputFile: z.string(),
      outputPattern: z.string(),
      tag: z.string().optional(),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputPattern, tag }) => {
    const args: string[] = [
      "--batch",
      `"${inputFile}"`,
      "--save-as",
      `"${outputPattern}"`
    ];

    if (tag) args.push("--tag", `"${tag}"`);

    const result = await runAsepriteCommand(args);

    return {
      content: [
        {
          type: "text",
          text: [
            "Aseprite frames exported",
            `command: ${result.command}`,
            result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
            result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
            `pattern: ${outputPattern}`
          ]
            .filter(Boolean)
            .join("\n")
        }
      ]
    };
  }
);

server.registerTool(
  "aseprite_export_metadata",
  {
    description: "Export metadata json from Aseprite file",
    inputSchema: z.object({
      inputFile: z.string(),
      dataFile: z.string(),
      format: z.string().optional(),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, dataFile, format }) => {
    const args: string[] = [
      "--batch",
      `"${inputFile}"`,
      "--data",
      `"${dataFile}"`
    ];

    if (format) args.push("--format", `"${format}"`);

    const result = await runAsepriteCommand(args);

    let metaText = "";
    try {
      metaText = readFileSync(dataFile, "utf8");
    } catch (e: unknown) {
      metaText = `Failed to read metadata: ${e instanceof Error ? e.message : String(e)}`;
    }

    return {
      content: [
        {
          type: "text",
          text: [
            "Aseprite metadata exported",
            `command: ${result.command}`,
            result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
            result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
            `dataFile: ${dataFile}`,
            "",
            "----- metadata -----",
            metaText
          ]
            .filter(Boolean)
            .join("\n")
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
