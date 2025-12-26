import { errorResult, successResult } from "../util.js";
import { findLuaTemplate, LUA_TEMPLATES, runLuaScript } from "./templates.js";
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
  
  const aseprite_run_lua_template: ToolCallback<typeof toolSchemas.aseprite_run_lua_template> = async ({
    templateId,
    params = {}
  }) => {
    const template = findLuaTemplate(templateId);
    if (!template) {
      return errorResult("aseprite_run_lua_template", new Error(`Unknown templateId: ${templateId}`));
    }

    const missing = template.params.filter(key => !params.hasOwnProperty(key));
    if (missing.length > 0) {
      return errorResult("aseprite_run_lua_template", new Error(`Missing required params: ${missing.join(", ")}`));
    }

    try {
      const result = await runLuaScript(template.scriptPath, params);

      return successResult("aseprite_run_lua_template", {
        command: result.command,
        templateId,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim()
      });
    } catch (err: unknown) {
      return errorResult("aseprite_run_lua_template", new Error(`Execution failed: ${err instanceof Error ? err.message : String(err)}`));
    }
  };

  const aseprite_run_lua_script: ToolCallback<typeof toolSchemas.aseprite_run_lua_script> = async ({
    scriptPath,
    scriptContent,
    params = {}
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

      const result = await runLuaScript(luaFilePath, params);

      return successResult("aseprite_run_lua_script", {
        command: result.command,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim()
      });

    } catch (err: unknown) {
      return errorResult("aseprite_run_lua_script", new Error(`Execution failed: ${err instanceof Error ? err.message : String(err)}`));
    }
  };

  return {
    aseprite_list_lua_templates,
    aseprite_run_lua_template,
    aseprite_run_lua_script
  };
};

export function createToolSchemas() {
  return {
    aseprite_run_lua_template: z.object({
      templateId: z.string(),
      params: z.record(z.string(), z.any()).optional()
    }),
    aseprite_run_lua_script: z
      .object({
        scriptPath: z.string().optional(),
        scriptContent: z.string().optional(),
        params: z.record(z.string(), z.any()).optional()
      })
      .refine(v => !!v.scriptPath || !!v.scriptContent, {
        message: "Either scriptPath or scriptContent is required."
      }),
    lua_output_result: z.object({
      content: z.array(
        z.object({
          type: z.literal("text"),
          text: z.string()
        })
      )
    })
  };
}