import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import z from "zod";
import { errorResult, successResult } from "../util.js";
import { analyzeCharacterFromMetadata, AsepriteJson } from "./character.js";
import { ensureSafePath } from "../aseprite/path.js";
import { runAsepriteCommand } from "../aseprite/cli.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runLuaScriptFile } from "../lua/cli.js";

interface CharacterExportResultItem {
  tag: string;
  png: string;
  json: string;
  frames: number;
}

const toolSchemas = createToolSchemas();

export function createToolHandlers() {
  const character_pipeline_analyze: ToolCallback<typeof toolSchemas.character_pipeline_analyze> = async ({ inputFile }) => {
    try {
      const inputAbs = ensureSafePath(inputFile, { mustExist: true });
  
      const tempJsonPath = path.join(
        os.tmpdir(),
        `${inputFile}-analyze-${Date.now()}.json`
      );
  
      const args = [
        "--batch",
        `"${inputAbs}"`,
        "--data",
        `"${tempJsonPath}"`,
        "--list-tags",
        "--list-layers"
      ];
  
      const result = await runAsepriteCommand(args);
  
      const metaJson = await fs.readFile(tempJsonPath, "utf8");
      const parsedMeta: AsepriteJson = JSON.parse(metaJson);
  
      const analysis = analyzeCharacterFromMetadata(inputAbs, parsedMeta);
  
      return successResult("character_pipeline_analyze", {
        command: result.command,
        inputFile: inputAbs,
        analysis,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });
    } catch (err: unknown) {
      return errorResult(
        "character_pipeline_analyze",
        `Character analysis failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const character_pipeline_normalize: ToolCallback<typeof toolSchemas.character_pipeline_normalize> = async ({ inputFile, saveOutput, targetMs, autoCrop }) => {
    try {
      const inputAbs = ensureSafePath(inputFile, { mustExist: true });
      const baseDir = path.dirname(inputAbs);
      const baseName = path.basename(inputAbs, path.extname(inputAbs));
  
      const outputPath =
        saveOutput ??
        path.join(baseDir, `${baseName}_normalized.aseprite`);
  
      const outputAbs = ensureSafePath(outputPath, { mustExist: false });
  
      const targetDuration = targetMs ?? 100;
      const autoCropEnabled = autoCrop ?? true;
  
      const result = await runLuaScriptFile(path.join(__dirname, "../lua/templates/character_normalize.lua"), {
        inputFile: inputAbs,
        saveOutput: outputAbs,
        targetMs: targetDuration,
        autoCrop: autoCropEnabled
      });
  
      if (result.timedOut) {
        return errorResult("character_pipeline_normalize", "Lua script timed out while normalizing character");
      }
  
      return successResult("character_pipeline_normalize", {
        command: result.command,
        inputFile: inputAbs,
        outputFile: outputAbs,
        targetMs: targetDuration,
        autoCrop: autoCropEnabled,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });
    } catch (err: unknown) {
      return errorResult(
        "character_pipeline_normalize",
        `Character normalization failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  const character_pipeline_export: ToolCallback<typeof toolSchemas.character_pipeline_export> = async ({ inputFile, exportDir, sheetType = "packed", format = "json-hash" }) => {
    try {
      const inputAbs = ensureSafePath(inputFile, { mustExist: true });
      const exportDirAbs = ensureSafePath(exportDir, { mustExist: false });
  
      await fs.mkdir(exportDirAbs, { recursive: true });
      
      const tempJsonPath = path.join(
        os.tmpdir(),
        `${inputFile}-export-${Date.now()}.json`
      );
  
      const metaArgs = [
        "--batch",
        `"${inputAbs}"`,
        "--data",
        `"${tempJsonPath}"`,
        "--list-tags"
      ];
  
      await runAsepriteCommand(metaArgs);
      const metaJson = await fs.readFile(tempJsonPath, "utf8");
      const parsedMeta: AsepriteJson = JSON.parse(metaJson);
  
      const tags = parsedMeta.meta.frameTags ?? [];
      if (tags.length === 0) {
        return errorResult("character_pipeline_export", "No tags found in sprite. Define animation tags before export.");
      }
  
      const baseName = path.basename(inputAbs, path.extname(inputAbs));
      const generated: CharacterExportResultItem[] = [];
  
      for (const tag of tags) {
        const tagName = tag.name;
        const safeTag = tagName.toLowerCase();
  
        const pngPath = path.join(
          exportDirAbs,
          `${baseName}_${safeTag}.png`
        );
        const jsonPath = path.join(
          exportDirAbs,
          `${baseName}_${safeTag}.json`
        );
  
        const args = [
          "--batch",
          `"${inputAbs}"`,
          "--tag",
          `"${tagName}"`,
          "--sheet",
          `"${pngPath}"`,
          "--data",
          `"${jsonPath}"`,
          "--sheet-type",
          sheetType,
          "--format",
          format
        ];
  
        await runAsepriteCommand(args);
  
        generated.push({
          tag: tagName,
          png: pngPath,
          json: jsonPath,
          frames: tag.to - tag.from + 1
        });
      }
  
      return successResult("character_pipeline_export", {
        inputFile: inputAbs,
        exportDir: exportDirAbs,
        sheetType,
        format,
        generated,
      });
    } catch (err: unknown) {
      return errorResult(
        "character_pipeline_export",
        `Character export failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  const character_pipeline_build: ToolCallback<typeof toolSchemas.character_pipeline_build> = async ({ 
    inputFile, 
    tempOutput, 
    exportDir, 
    normalizeOption = { targetMs: 100, autoCrop: true }, 
    exportOption = { sheetType: "packed", format: "json-hash" } 
  }) => {
    try {
      const inputAbs = ensureSafePath(inputFile, { mustExist: true });
  
      const baseDir = path.dirname(inputAbs);
      const baseName = path.basename(inputAbs, path.extname(inputAbs));
  
      const normalizedOutput =
        tempOutput ??
        path.join(baseDir, `${baseName}_normalized.aseprite`);
  
      const exportDirAbs = ensureSafePath(exportDir, { mustExist: false });
  
      const analyzeResponse = await character_pipeline_analyze({ inputFile: inputAbs }, {} as any);
      const analyzeContent = analyzeResponse.content[0] as { text: string };
      const analyzeParsed = JSON.parse(analyzeContent.text);
      if (!analyzeParsed.success) {
        return errorResult("character_pipeline_build", analyzeParsed.error);
      }
  
      const normalizeResponse = await character_pipeline_normalize({
        inputFile: inputAbs,
        saveOutput: normalizedOutput,
        targetMs: normalizeOption.targetMs,
        autoCrop: normalizeOption.autoCrop,
      }, {} as any);
      const normalizeContent = normalizeResponse.content[0] as { text: string };
      const normalizeParsed = JSON.parse(normalizeContent.text);
      if (!normalizeParsed.success) {
        return errorResult("character_pipeline_build", normalizeParsed.error);
      }
      
      const exportResponse = await character_pipeline_export({
        inputFile: normalizedOutput,
        exportDir: exportDirAbs,
        sheetType: exportOption.sheetType,
        format: exportOption.format,
      }, {} as any);
      const exportContent = exportResponse.content[0] as { text: string };
      const exportParsed = JSON.parse(exportContent.text);
      if (!exportParsed.success) {
        return errorResult("character_pipeline_build", exportParsed.error);
      }
  
      return successResult("character_pipeline_build", {
        inputFile: inputAbs,
        normalizedFile: normalizedOutput,
        exportDir: exportDirAbs,
        analyze: analyzeParsed.result,
        normalize: normalizeParsed.result,
        export: exportParsed.result,
      });
    } catch (err: unknown) {
      return errorResult("character_pipeline_build", `Character pipeline failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    character_pipeline_analyze,
    character_pipeline_normalize,
    character_pipeline_export,
    character_pipeline_build,
  };
}

export function createToolSchemas() {
  return {
    character_pipeline_analyze: z.object({
      inputFile: z.string(),
    }),
    character_pipeline_normalize: z.object({
      inputFile: z.string(),
      saveOutput: z.string().optional(),
      targetMs: z.number().optional(),
      autoCrop: z.boolean().optional(),
    }),
    character_pipeline_export: z.object({
      inputFile: z.string(),
      exportDir: z.string(),
      sheetType: z.enum(["packed", "rows"]).optional(),
      format: z.enum(["json-hash", "json-array"]).optional(),
    }),
    character_pipeline_build: z.object({
      inputFile: z.string(),
      tempOutput: z.string().optional(),
      exportDir: z.string(),
      normalizeOption: z.object({
        targetMs: z.number().optional(),
        autoCrop: z.boolean().optional(),
      }).optional(),
      exportOption: z.object({
        sheetType: z.enum(["packed", "rows"]).optional(),
        format: z.enum(["json-hash", "json-array"]).optional(),
      }).optional(),
    }),
    character_pipeline_analyze_result: z.object({
      command: z.string(),
      inputFile: z.string(),
      analysis: z.any(),
      stdout: z.string(),
      stderr: z.string(),
    }),
    character_pipeline_normalize_result: z.object({
      command: z.string(),
      inputFile: z.string(),
      outputFile: z.string(),
      targetMs: z.number(),
      autoCrop: z.boolean(),
      stdout: z.string().optional(),
      stderr: z.string().optional(),
    }),
    character_pipeline_export_result: z.object({
      inputFile: z.string(),
      exportDir: z.string(),
      sheetType: z.enum(["packed", "rows"]),
      format: z.enum(["json-hash", "json-array"]),
      generated: z.array(z.object({
        tag: z.string(),
        png: z.string(),
        json: z.string(),
        frames: z.number(),
      })),
    }),
    character_pipeline_build_result: z.object({
      inputFile: z.string(),
      normalizedFile: z.string(),
      exportDir: z.string(),
      analyze: z.any(),
      normalize: z.any(),
      export: z.any(),
    }),
  };
}