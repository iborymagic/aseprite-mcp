import z from "zod";
import { errorResult, successResult } from "../util.js";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ImageGenerator } from "./image-generator.js";
import { ensureSafePath } from "../aseprite/path.js";
import path from "path";
import fs from "node:fs/promises";
import { runLuaScriptFile } from "../lua/cli.js";
import { createToolHandlers as createPipelineToolHandlers } from "../pipeline/tools.js";

const toolSchemas = createToolSchemas();

export function createToolHandlers() {  
  const character_generate_concept: ToolCallback<typeof toolSchemas.character_generate_concept> = async ({
    params: {
      prompt,
      workspaceDir,
      fileName = "concept.png",
      width = 256,
      height = 256,
      seed,
      stylePreset = "pixel_art"
    },
    generator
  }) => {
    try {
      const workspaceAbs = ensureSafePath(workspaceDir, { mustExist: false });
      await fs.mkdir(workspaceAbs, { recursive: true });
  
      const outputPath = path.join(workspaceAbs, fileName);
  
      const result = await generator.generate({
        prompt,
        negativePrompt: undefined,
        width,
        height,
        seed,
        stylePreset,
        outputPath
      });
  
      return successResult("character_generate_concept", {
        prompt,
        workspaceDir: workspaceAbs,
        imagePath: result.imagePath,
        seed: result.seed
      });
    } catch (err: unknown) {
      return errorResult(
        "character_generate_concept",
        `Character generate concept failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const character_import_from_concept: ToolCallback<typeof toolSchemas.character_import_from_concept> = async ({
    params: {
      conceptImage,
      outputFile,
      spriteSize: spriteSizeParam = 0,
      animationSpec: animationSpecParam = "Idle:4"
    },
  }) => {
    try {
      const conceptAbs = ensureSafePath(conceptImage, {
        mustExist: true
      });
      const outputAbs = ensureSafePath(outputFile, {
        mustExist: false
      });
  
      const spriteSize = spriteSizeParam ?? 0;
      const animationSpec = animationSpecParam ?? "Idle:4";
  
      const luaScriptPath = path.join(
        process.cwd(),
        "lua-templates",
        "character_import_from_concept.lua"
      );
  
      const result = await runLuaScriptFile(luaScriptPath, {
        conceptImage: conceptAbs,
        outputFile: outputAbs,
        spriteSize,
        animationSpec
      });
  
      if (result.timedOut) {
        return errorResult(
          "character_import_from_concept",
          `Lua script timed out while importing from concept: ${luaScriptPath}`
        );
      }
  
      return successResult("character_import_from_concept", {
        command: result.command,
        conceptImage: conceptAbs,
        outputFile: outputAbs,
        spriteSize,
        animationSpec
      });
    } catch (err: unknown) {
      return errorResult(
        "character_import_from_concept",
        `Character import from concept failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const character_generate_full: ToolCallback<typeof toolSchemas.character_generate_full> = async ({
    params: {
      prompt,
      config,
      paths
    },
    generator
  }) => {
    try {
      const spriteSize = config?.spriteSize ?? 32;
      const animations =
        config?.animations ?? [
          { name: "Idle", frames: 4 },
          { name: "Walk", frames: 8 }
        ];
      const seed = config?.seed;
  
      const charName =
        (paths.name ??
        prompt
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 32)) ||
        "character";
  
      const workspaceBase = ensureSafePath(paths.workspaceDir, {
        mustExist: false
      });
      const exportBase = ensureSafePath(paths.exportDir, {
        mustExist: false
      });
  
      const workspaceDir = path.join(workspaceBase, charName);
      const exportDir = path.join(exportBase, charName);
  
      await fs.mkdir(workspaceDir, { recursive: true });
      await fs.mkdir(exportDir, { recursive: true });
  
      const conceptResult = await character_generate_concept(
        {
          params: {
            prompt,
            workspaceDir,
            fileName: "concept.png",
            width: spriteSize * 8,
            height: spriteSize * 8,
            seed,
            stylePreset: "pixel_art"
          },
          generator
        }, {} as any);
  
      const conceptContent = conceptResult.content?.[0] as any;
      const conceptJson = conceptContent
        ? JSON.parse(conceptContent.text)
        : null;
  
      if (!conceptJson || !conceptJson.success) {
        return errorResult("character_generate_full", {
          stage: "generate_concept",
          error: conceptJson?.error ?? "Concept generation failed"
        });
      }
  
      const conceptImage = conceptJson.result.imagePath as string;
  
      const animationSpec = animations
        .map((a) => `${a.name}:${a.frames}`)
        .join(",");
  
      const outputFile = path.join(workspaceDir, `${charName}.aseprite`);
  
      const importResult = await character_import_from_concept({
        params: {
          conceptImage,
          outputFile,
          spriteSize,
          animationSpec
        }
      }, {} as any);
  
      const importContent = importResult.content?.[0] as any;
      const importJson = importContent ? JSON.parse(importContent.text) : null;
  
      if (!importJson || !importJson.success) {
        return errorResult("character_generate_full", {
          stage: "import_sprite",
          error: importJson?.error ?? "Sprite import failed"
        });
      }
  
      const asepriteFile = importJson.result.asepriteFile as string;
  
      const pipelineToolHandlers = createPipelineToolHandlers();
      const buildResult = await pipelineToolHandlers.character_pipeline_build({
        inputFile: asepriteFile,
        exportDir
      }, {} as any);
  
      const buildContent = buildResult.content?.[0] as any;
      const buildJson = buildContent ? JSON.parse(buildContent.text) : null;
  
      if (!buildJson || !buildJson.success) {
        return errorResult("character_generate_full", {
          stage: "pipeline_build",
          error: buildJson?.error ?? "Character pipeline build failed"
        });
      }
  
      return successResult("character_generate_full", {
        name: charName,
        prompt,
        spriteSize,
        workspaceDir,
        exportDir,
        concept: conceptJson.result,
        asepriteFile,
        pipeline: buildJson.result
      });
    } catch (err: unknown) {
      return errorResult(
        "character_generate_full",
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }  

  return {
    character_generate_concept: async (params: any, generator: ImageGenerator) =>
      character_generate_concept({
        params,
        generator
      }, {} as any),
    character_import_from_concept,
    character_generate_full: async (params: any, generator: ImageGenerator) =>
      character_generate_full({
        params,
        generator
      }, {} as any),
  };
}

export function createToolSchemas() {
  return {
    character_generate_concept: z.object({
      params: z.object({
        prompt: z.string(),
        workspaceDir: z.string(),
        fileName: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        seed: z.number().optional(),
        stylePreset: z.string().optional(),
      }),
      generator: z.custom<ImageGenerator>(),
    }),
    character_import_from_concept: z.object({
      params: z.object({
        conceptImage: z.string(),
        outputFile: z.string(),
        spriteSize: z.number().optional(),
        animationSpec: z.string().optional(),
      }),
    }),
    character_generate_full: z.object({
      params: z.object({
        prompt: z.string(),
        config: z.object({
          spriteSize: z.number().optional(),
          animations: z.array(z.object({ name: z.string(), frames: z.number() })).optional(),
          seed: z.number().optional(),
        }),
        paths: z.object({
          workspaceDir: z.string(),
          exportDir: z.string(),
          name: z.string().optional(),
        }),
      }),
      generator: z.custom<ImageGenerator>(),
    }),
  };
}