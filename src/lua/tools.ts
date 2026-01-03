import { errorResult, successResult } from "../util.js";
import { findLuaTemplate, LUA_TEMPLATES } from "./template.js";
import { runLuaScriptFile } from "./cli.js";
import { ensureSafePath } from "../aseprite/path.js";
import path from "node:path";
import z from "zod";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import os from "node:os";
import fs from "node:fs/promises";

const toolSchemas = createToolSchemas();

export function createToolHandlers() {
  const aseprite_list_lua_templates = async () => {
    return successResult("aseprite_list_lua_templates", {
      templates: LUA_TEMPLATES.map(template => ({
        id: template.id,
        description: template.description,
        params: template.params,
        optionalParams: template.optionalParams ?? []
      }))
    });
  }
  
  const run_lua_template = async ({
    templateId,
    params
  }: {
    templateId: string;
    params: { inputFile: string } & Record<string, unknown>;
  }) => {
    const template = findLuaTemplate(templateId);
    if (!template) {
      throw new Error(`Unknown templateId: ${templateId}`);
    }

    const missing = template.params.filter(key => !params.hasOwnProperty(key));
    if (missing.length > 0) {
      throw new Error(`Missing required params: ${missing.join(", ")}`);
    }

    const result = await runLuaScriptFile(template.scriptPath, params);

    if (result.timedOut) {
      throw new Error(`Lua script timed out while executing template: ${templateId}`);
    }

    const stderrTrimmed = result.stderr.trim();
    const stdoutTrimmed = result.stdout.trim();
    
    if (stderrTrimmed && stderrTrimmed.includes("ERROR:")) {
      throw new Error(`Script execution failed: ${stderrTrimmed}`);
    }

    if (stdoutTrimmed && stdoutTrimmed.includes("ERROR:")) {
      throw new Error(`Script execution failed: ${stdoutTrimmed}`);
    }

    return {
      command: result.command,
      stdout: stdoutTrimmed,
      stderr: stderrTrimmed,
    };
  };

  const auto_crop_transparent: ToolCallback<typeof toolSchemas.auto_crop_transparent> = async ({
    saveOutput,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "auto_crop_transparent",
        params: { 
          inputFile, 
          saveOutput : ensureSafePath(saveOutput, { createDirIfNeeded: true }) 
        }
      });
  
      return successResult("auto_crop_transparent", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("auto_crop_transparent", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const merge_visible_layers: ToolCallback<typeof toolSchemas.merge_visible_layers> = async ({
    saveOutput,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "merge_visible_layers",
        params: { 
          inputFile, 
          saveOutput : ensureSafePath(saveOutput, { createDirIfNeeded: true }) 
        }
      });

      return successResult("merge_visible_layers", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("merge_visible_layers", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const normalize_animation_speed: ToolCallback<typeof toolSchemas.normalize_animation_speed> = async ({
    saveOutput,
    targetDuration,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "normalize_animation_speed",
        params: { 
          inputFile, 
          saveOutput : ensureSafePath(saveOutput, { createDirIfNeeded: true }), 
          targetDuration 
        }
      });

      return successResult("normalize_animation_speed", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("normalize_animation_speed", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const recolor_palette: ToolCallback<typeof toolSchemas.recolor_palette> = async ({
    saveOutput,
    mapping,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "recolor_palette",
        params: { 
          saveOutput : ensureSafePath(saveOutput, { createDirIfNeeded: true }), 
          mapping,
          inputFile
        }
      });

      return successResult("recolor_palette", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("recolor_palette", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const remove_layer_by_name: ToolCallback<typeof toolSchemas.remove_layer_by_name> = async ({
    layerName,
    saveOutput,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "remove_layer_by_name",
        params: { 
          layerName, 
          saveOutput : ensureSafePath(saveOutput, { createDirIfNeeded: true }),
          inputFile
        }
      });

      return successResult("remove_layer_by_name", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("remove_layer_by_name", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const export_layer_only: ToolCallback<typeof toolSchemas.export_layer_only> = async ({
    layerName,
    outputDir,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "export_layer_only",
        params: { 
          layerName, 
          outputDir : ensureSafePath(outputDir, { createDirIfNeeded: true }),
          inputFile
        }
      });

      return successResult("export_layer_only", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("export_layer_only", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const export_tag_frames: ToolCallback<typeof toolSchemas.export_tag_frames> = async ({
    tag,
    outputDir,
    filenamePrefix,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "export_tag_frames",
        params: { 
          tag, 
          outputDir : ensureSafePath(outputDir, { createDirIfNeeded: true }),
          filenamePrefix : filenamePrefix,
          inputFile
        }
      });

      return successResult("export_tag_frames", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("export_tag_frames", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_is_layer_exists: ToolCallback<typeof toolSchemas.get_is_layer_exists> = async ({
    layerName,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_is_layer_exists",
        params: { layerName, inputFile }
      });

      return successResult("get_is_layer_exists", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_is_layer_exists", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_is_tag_exists: ToolCallback<typeof toolSchemas.get_is_tag_exists> = async ({
    tagName,
    inputFile
  }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_is_tag_exists",
        params: { tagName, inputFile }
      });

      return successResult("get_is_tag_exists", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_is_tag_exists", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_palette_info: ToolCallback<typeof toolSchemas.get_palette_info> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_palette_info",
        params: { inputFile }
      });
      
      return successResult("get_palette_info", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_palette_info", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  const get_selection_bounds: ToolCallback<typeof toolSchemas.get_selection_bounds> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_selection_bounds",
        params: { inputFile }
      });
      
      return successResult("get_selection_bounds", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_selection_bounds", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_tag_list: ToolCallback<typeof toolSchemas.get_tag_list> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_tag_list",
        params: { inputFile }
      });

      return successResult("get_tag_list", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_tag_list", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  const get_layer_list: ToolCallback<typeof toolSchemas.get_layer_list> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_layer_list",
        params: { inputFile }
      });

      return successResult("get_layer_list", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_layer_list", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_frame_info: ToolCallback<typeof toolSchemas.get_frame_info> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_frame_info",
        params: { inputFile }
      });

      return successResult("get_frame_info", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_frame_info", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const get_active_sprite_info: ToolCallback<typeof toolSchemas.get_active_sprite_info> = async ({ inputFile }) => {
    try {
      const result = await run_lua_template({
        templateId: "get_active_sprite_info",
        params: { inputFile }
      });

      return successResult("get_active_sprite_info", {
        command: result.command,
        stdout: result.stdout,
        stderr: result.stderr
      });
    } catch (err: unknown) {
      return errorResult("get_active_sprite_info", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const aseprite_run_lua_script: ToolCallback<typeof toolSchemas.aseprite_run_lua_script> = async ({
    scriptPath,
    scriptContent,
    params
  }) => {
    try {
      let luaFilePath: string;

      if (scriptPath) {
        luaFilePath = ensureSafePath(scriptPath, { mustExist: true });
      } else {
        const tempPath = path.join(os.tmpdir(), `aseprite-mcp-${Date.now()}.lua`);
        await fs.writeFile(tempPath, String(scriptContent), "utf8");
        luaFilePath = tempPath;
      }

      const result = await runLuaScriptFile(luaFilePath, params);

      if (result.timedOut) {
        return errorResult(
          "aseprite_run_lua_script",
          `Lua script timed out while executing script: ${luaFilePath}`
        );
      }  

      const stderrTrimmed = result.stderr.trim();
      const stdoutTrimmed = result.stdout.trim();
      
      if (stderrTrimmed && stderrTrimmed.includes("ERROR:")) {
        return errorResult(
          "aseprite_run_lua_script",
          `Script execution failed: ${stderrTrimmed}`
        );
      }

      if (stdoutTrimmed && stdoutTrimmed.includes("ERROR:")) {
        return errorResult(
          "aseprite_run_lua_script",
          `Script execution failed: ${stdoutTrimmed}`
        );
      }

      return successResult("aseprite_run_lua_script", {
        command: result.command,
        stdout: stdoutTrimmed,
        stderr: stderrTrimmed
      });

    } catch (err: unknown) {
      return errorResult("aseprite_run_lua_script", `Execution failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return {
    aseprite_list_lua_templates,
    aseprite_run_lua_script,
    auto_crop_transparent,
    merge_visible_layers,
    normalize_animation_speed,
    recolor_palette,
    remove_layer_by_name,
    export_layer_only,
    export_tag_frames,
    get_is_layer_exists,
    get_is_tag_exists,
    get_palette_info,
    get_selection_bounds,
    get_tag_list,
    get_layer_list,
    get_frame_info,
    get_active_sprite_info,
  };
};

export function createToolSchemas() {
  return {
    aseprite_run_lua_script: z
      .object({
        scriptPath: z.string().optional(),
        scriptContent: z.string().optional(),
        params: z.object({
          inputFile: z.string(),
        }).passthrough()
      })
      .refine(v => !!v.scriptPath || !!v.scriptContent, {
        message: "Either scriptPath or scriptContent is required."
      }),
    auto_crop_transparent: z.object({
      saveOutput: z.string(),
      inputFile: z.string(),
    }),
    merge_visible_layers: z.object({
      saveOutput: z.string(),
      inputFile: z.string(),
    }),
    normalize_animation_speed: z.object({
      saveOutput: z.string(),
      targetDuration: z.number(),
      inputFile: z.string(),
    }),
    recolor_palette: z.object({
      saveOutput: z.string(),
      mapping: z.string(),
      inputFile: z.string(),
    }),
    remove_layer_by_name: z.object({
      layerName: z.string(),
      saveOutput: z.string(),
      inputFile: z.string(),
    }),
    export_layer_only: z.object({
      layerName: z.string(),
      outputDir: z.string(),
      inputFile: z.string(),
    }),
    export_tag_frames: z.object({
      tag: z.string(),
      outputDir: z.string(),
      filenamePrefix: z.string().optional(),
      inputFile: z.string(),
    }),
    get_is_layer_exists: z.object({
      layerName: z.string(),
      inputFile: z.string(),
    }),
    get_is_tag_exists: z.object({
      tagName: z.string(),
      inputFile: z.string(),
    }),
    get_palette_info: z.object({
      inputFile: z.string(),
    }),
    get_selection_bounds: z.object({
      inputFile: z.string(),
    }),
    get_tag_list: z.object({
      inputFile: z.string(),
    }),
    get_layer_list: z.object({
      inputFile: z.string(),
    }),
    get_frame_info: z.object({
      inputFile: z.string(),
    }),
    get_active_sprite_info: z.object({
      inputFile: z.string(),
    }),
  };
}