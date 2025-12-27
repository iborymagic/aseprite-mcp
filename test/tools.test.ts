import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createToolHandlers as createAsepriteToolHandlers } from "../src/aseprite/tools.js";
import { createToolHandlers as createLuaToolHandlers } from "../src/lua/tools.js";
import path from "node:path";
import { expect, describe, it, beforeAll } from "vitest";

const TEST_ASSET = path.join(__dirname, "assets", "sample.aseprite");
const LAYER_TEST_ASSET = path.join(__dirname, "assets", "layer_sample.aseprite");
const TAG_TEST_ASSET = path.join(__dirname, "assets", "tag_sample.aseprite");
const LUA_OUTPUT = path.join(__dirname, "assets", "lua_output");

function expectBaseResult(result: any) {
  expect(result).toBeDefined();
  expect(result.success).toBe(true);
  expect(result.tool).toBeDefined();

  if (result.success) {
    expect(result.result).toBeDefined();
  } else {
    expect(result.error).toBeDefined();
  }
}

const asepriteToolHandlers = createAsepriteToolHandlers();
const luaToolHandlers = createLuaToolHandlers();

describe("Aseprite MCP tools", () => {
  it("should check environment", async () => {
    const result = await asepriteToolHandlers.aseprite_check_environment();
    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
  });

  it("should export sheet", async () => {
    const result = await asepriteToolHandlers.aseprite_export_sheet({ 
      inputFile: TEST_ASSET, 
      outputSheet: "test/assets/test.png",
      sheetType: "packed"
    }, {} as any);
    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync("test/assets/test.png")).toBe(true);
  });

  it("should export frames", async () => {
    const result = await asepriteToolHandlers.aseprite_export_frames({ 
      inputFile: TEST_ASSET, 
      outputPattern: "test/assets/test_frames/frame_{frame}.png" 
    }, {} as any);
    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync("test/assets/test_frames/frame_0.png")).toBe(true);
  });

  it("should export metadata", async () => {
    const result = await asepriteToolHandlers.aseprite_export_metadata({ 
      inputFile: TEST_ASSET, 
      dataFile: "test/assets/test.json" 
    }, {} as any);
    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    const meta = JSON.parse(readFileSync("test/assets/test.json", "utf8"));
    expect(meta).toHaveProperty("frames");
  });
});

describe("Aseprite MCP Lua templates", () => {
  beforeAll(() => {
    if (existsSync(LUA_OUTPUT)) rmSync(LUA_OUTPUT, { recursive: true, force: true });
    mkdirSync(LUA_OUTPUT, { recursive: true });
  });

  it("should remove layer by name", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "remove_layer_by_name",
      params: {
        inputFile: LAYER_TEST_ASSET,
        layerName: "shadow",
        saveOutput: `${LUA_OUTPUT}/removed.aseprite`
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/removed.aseprite`)).toBe(true);
  });

  it("should recolor palette", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "recolor_palette",
      params: {
        inputFile: LAYER_TEST_ASSET,
        saveOutput: `${LUA_OUTPUT}/recolored.aseprite`,
        mapping: "000000:000000;FFFFFF:FFFFFF;FF0000:00FF00"
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/recolored.aseprite`)).toBe(true);
  });

  it("should normalize animation speed", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "normalize_animation_speed",
      params: {
        inputFile: TEST_ASSET,
        saveOutput: `${LUA_OUTPUT}/normalized.aseprite`,
        targetDuration: 0.1
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/normalized.aseprite`)).toBe(true);
  });
  
  it("should auto crop transparent sprite", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "auto_crop_transparent",
      params: {
        inputFile: TEST_ASSET,
        saveOutput: `${LUA_OUTPUT}/cropped.aseprite`
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/cropped.aseprite`)).toBe(true);
  });

  it("should merge visible layers", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "merge_visible_layers",
      params: {
        inputFile: LAYER_TEST_ASSET,
        saveOutput: `${LUA_OUTPUT}/merged.aseprite`
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/merged.aseprite`)).toBe(true);
  });

  it("should export only specified layer", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "export_layer_only",
      params: {
        inputFile: LAYER_TEST_ASSET,
        layerName: "shadow",
        outputDir: LUA_OUTPUT
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
    expect(existsSync(`${LUA_OUTPUT}/shadow.png`)).toBe(true);
  });

  it("should export frames inside a tag", async () => {
    const result = await luaToolHandlers.aseprite_run_lua_template({
      templateId: "export_tag_frames",
      params: {
        inputFile: TAG_TEST_ASSET,
        tag: "walk",
        outputDir: `${LUA_OUTPUT}/walk`,
        filenamePrefix: "walk"
      }
    }, {} as any);

    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);

    // There should be at least one frame
    expect(existsSync(`${LUA_OUTPUT}/walk/walk-0001.png`)).toBe(true);
  });
});