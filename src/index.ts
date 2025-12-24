import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveAsepritePath } from "./aseprite/env.js";
import { runAsepriteCommand } from "./aseprite/cli.js";
import z from "zod";
import { readFileSync } from "node:fs";
import { ensureSafePath } from "./aseprite/path.js";
import { errorResult, successResult } from "./util.js";

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
    try {
      const asepritePath = await resolveAsepritePath();
      const { stdout: version } = await runAsepriteCommand(["--version"]);
      return successResult("aseprite_check_environment", { path: asepritePath, version });
    } catch (e: unknown) {
      return errorResult("aseprite_check_environment", e instanceof Error ? e.message : String(e));
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
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputSheet, sheetType, dataFile, tag }) => {
    try {
      const inputAbsPath = ensureSafePath(inputFile, { mustExist: true });
      const sheetAbsPath = ensureSafePath(outputSheet, { createDirIfNeeded: true });
      const dataAbsPath = dataFile ? ensureSafePath(dataFile, { createDirIfNeeded: true }) : undefined;
      
      const args: string[] = [
        "--batch",
        `"${inputAbsPath}"`,
        "--sheet",
        `"${sheetAbsPath}"`,
        "--sheet-type",
        sheetType
      ];
  
      if (tag) args.push("--tag", `"${tag}"`);
      if (dataAbsPath) args.push("--data", `"${dataAbsPath}"`);
  
      const result = await runAsepriteCommand(args);
  
      return successResult("aseprite_export_sheet", {
        command: result.command,
        inputFile: inputAbsPath,
        outputSheet: sheetAbsPath,
        sheetType,
        dataFile: dataAbsPath ? dataAbsPath : undefined,
        tag: tag ? tag : undefined,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });
    } catch (e: unknown) {
      return errorResult("aseprite_export_sheet", e instanceof Error ? e.message : String(e));
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
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, outputPattern, tag }) => {
    try {
      const inputAbsPath = ensureSafePath(inputFile, { mustExist: true });
      const outputAbsPath = ensureSafePath(outputPattern, { createDirIfNeeded: true });

      const args: string[] = [
        "--batch",
        `"${inputAbsPath}"`,
        "--save-as",
        `"${outputAbsPath}"`
      ];
  
      if (tag) args.push("--tag", `"${tag}"`);
  
      const result = await runAsepriteCommand(args);
  
      return successResult("aseprite_export_frames", {
        command: result.command,
        inputFile: inputAbsPath,
        outputPattern: outputAbsPath,
        tag: tag ? tag : undefined,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });
    } catch (e: unknown) {
      return errorResult("aseprite_export_frames", e instanceof Error ? e.message : String(e));
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
    }),
    outputSchema: z.object({
      content: z.array(z.object({
        type: z.literal("text"),
        text: z.string(),
      })),
    }),
  },
  async ({ inputFile, dataFile, format }) => {
    try {
      const inputAbsPath = ensureSafePath(inputFile, { mustExist: true });
      const dataAbsPath = ensureSafePath(dataFile, { createDirIfNeeded: true });

      const args: string[] = [
        "--batch",
        `"${inputAbsPath}"`,
        "--data",
        `"${dataAbsPath}"`
      ];
  
      if (format) args.push("--format", `"${format}"`);
  
      const result = await runAsepriteCommand(args);
  
      let metaText = "";
      try {
        metaText = readFileSync(dataAbsPath, "utf8");
      } catch (e: unknown) {
        metaText = `Failed to read metadata: ${e instanceof Error ? e.message : String(e)}`;
      }
  
      return successResult("aseprite_export_metadata", {
        command: result.command,
        inputFile: inputAbsPath,
        dataFile: dataAbsPath,
        format: format ? format : undefined,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
        metadata: metaText,
      });
    } catch (e: unknown) {
      return errorResult("aseprite_export_metadata", e instanceof Error ? e.message : String(e));
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
