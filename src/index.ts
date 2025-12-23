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
    inputSchema: {
      outputFormat: z.enum(["text", "json"]).optional().default("json"),
    },
    outputSchema: undefined,
  },
  async ({ outputFormat }) => {
    try {
      const asepritePath = await resolveAsepritePath();
      const { stdout: version } = await runAsepriteCommand(["--version"]);
      return {
        content: [
          {
            type: "text",
            text: outputFormat === "text" ? [
              'Aseprite detected',
              `Aseprite path: ${asepritePath}`, 
              `Aseprite version: ${version.trim()}`
            ].join("\n") : 
            JSON.stringify({
              success: true,
              tool: "aseprite_check_environment",
              path: asepritePath,
              version,
            }, null, 2)
          }
        ]
      };
    } catch (e: unknown) {
      return {
        content: [
          {
            type: "text",
            text: outputFormat === "text" ? `Failed to check Aseprite environment: ${e instanceof Error ? e.message : String(e)}`
            : JSON.stringify({
              success: false,
              tool: "aseprite_check_environment",
              error: e instanceof Error ? e.message : String(e)
            }, null, 2)
          }
        ]
      };
    }
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
      outputFormat: z.enum(["text", "json"]).optional().default("json"),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputSheet, sheetType, dataFile, tag, outputFormat }) => {
    try {
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
            text: outputFormat === "text" ? [
              "Aseprite sheet exported",
              `command: ${result.command}`,
              result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
              result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
              `sheet: ${outputSheet}`,
              dataFile ? `data: ${dataFile}` : ""
            ]
              .filter(Boolean)
              .join("\n")
            : JSON.stringify({
              success: true,
              tool: "aseprite_export_sheet",
              command: result.command,
              details: {
                inputFile,
                outputSheet,
                sheetType,
                dataFile: dataFile ? dataFile : undefined,
                tag: tag ? tag : undefined,
                stdout: result.stdout.trim(),
                stderr: result.stderr.trim(),
              }
            }, null, 2)
          }
        ]
      };
    } catch (e: unknown) {
      return {
        content: [
          {
            type: "text",
            text: outputFormat === "text" ? `Failed to export Aseprite sheet: ${e instanceof Error ? e.message : String(e)}`
            : JSON.stringify({
              success: false,
              tool: "aseprite_export_sheet",
              error: e instanceof Error ? e.message : String(e),
            }, null, 2)
          }
        ]
      };
    }
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
      outputFormat: z.enum(["text", "json"]).optional().default("json"),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputPattern, tag, outputFormat }) => {
    try {
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
            text: outputFormat === "text" ? [
              "Aseprite frames exported",
              `command: ${result.command}`,
              result.stdout.trim() ? `stdout:\n${result.stdout.trim()}` : "",
              result.stderr.trim() ? `stderr:\n${result.stderr.trim()}` : "",
              `pattern: ${outputPattern}`
            ]
              .filter(Boolean)
              .join("\n")
            : JSON.stringify({
              success: true,
              tool: "aseprite_export_frames",
              command: result.command,
              details: {
                inputFile,
                outputPattern,
                tag: tag ? tag : undefined,
                stdout: result.stdout.trim(),
                stderr: result.stderr.trim(),
              }
            }, null, 2)
          }
        ]
      }; 
    } catch (e: unknown) {
      return {
        content: [
          {
            type: "text",
            text: outputFormat === "text" ? `Failed to export Aseprite frames: ${e instanceof Error ? e.message : String(e)}`
            : JSON.stringify({
              success: false,
              tool: "aseprite_export_frames",
              error: e instanceof Error ? e.message : String(e),
            }, null, 2)
          }
        ]
      };
    }    
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
      outputFormat: z.enum(["text", "json"]).optional().default("json"),
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, dataFile, format, outputFormat }) => {
    try {
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
            text: outputFormat === "text" ? [
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
            : JSON.stringify({
              success: true,
              tool: "aseprite_export_metadata",
              command: result.command,
              details: {
                inputFile,
                dataFile,
                format: format ? format : undefined,
                stdout: result.stdout.trim(),
                stderr: result.stderr.trim(),
                metadata: metaText,
              }
            }, null, 2)
          }
        ]
      };
    } catch (e: unknown) {
      return {
        content: [
          {
            type: "text",
            text: outputFormat === "text" ? `Failed to export Aseprite metadata: ${e instanceof Error ? e.message : String(e)}`
            : JSON.stringify({
              success: false,
              tool: "aseprite_export_metadata",
              error: e instanceof Error ? e.message : String(e),
            }, null, 2)
          }
        ]
      };
    }
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
