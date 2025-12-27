import path from "node:path";
import { expect, describe, it } from "vitest";
import { createToolHandlers } from "../src/pipeline/tools.js";
import { existsSync } from "node:fs";

const TEST_CHARACTER = path.join(__dirname, "assets", "tag_sample.aseprite");

const toolHandlers = createToolHandlers();

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

describe("Character pipeline", () => {
  it("should analyze character sprite and return tags info", async () => {
    const result = await toolHandlers.character_pipeline_analyze(
      { inputFile: TEST_CHARACTER },
      {} as any
    );

    const resultContent = result.content[0] as { text: string };
    const parsed = JSON.parse(resultContent.text);

    expectBaseResult(parsed);
    expect(parsed.success).toBe(true);

    const analysis = parsed.result.analysis;
    expect(analysis).toBeDefined();
    expect(analysis.sprite.frames).toBeGreaterThan(0);
    expect(Array.isArray(analysis.tags)).toBe(true);
  });

  it("should normalize character sprite", async () => {
    const result = await toolHandlers.character_pipeline_normalize(
      {
        inputFile: TEST_CHARACTER,
        saveOutput: path.join(__dirname, "assets", "character_norm.aseprite"),
        targetMs: 100,
        autoCrop: true
      },
      {} as any
    );

    const resultContent = result.content[0] as { text: string };
    const parsed = JSON.parse(resultContent.text);

    expectBaseResult(parsed);
    expect(parsed.success).toBe(true);
    expect(existsSync(parsed.result.outputFile)).toBe(true);
  });
  
  it("should export character by tags", async () => {
    const result = await toolHandlers.character_pipeline_export(
      {
        inputFile: TEST_CHARACTER,
        exportDir: "test/assets/character_export",
      },
      {} as any
    );
    const resultContent = result.content[0] as { text: string };
    const parsed = JSON.parse(resultContent.text);

    expectBaseResult(parsed);
    expect(parsed.success).toBe(true);

    const generated = parsed.result.generated;
    expect(generated.length).toBeGreaterThan(0);
    expect(existsSync(generated[0].png)).toBe(true);
    expect(existsSync(generated[0].json)).toBe(true);
  });
  
  it("should run full character build pipeline", async () => {
    const result = await toolHandlers.character_pipeline_build(
      {
        inputFile: TEST_CHARACTER,
        exportDir: "test/assets/char_build",
      },
      {} as any
    );
  
    const resultContent = result.content[0] as { text: string };
    const parsed = JSON.parse(resultContent.text);
  
    expectBaseResult(parsed);
    expect(parsed.success).toBe(true);
    expect(existsSync(parsed.result.normalizedFile)).toBe(true);
    expect(existsSync(parsed.result.exportDir)).toBe(true);
    expect(parsed.result.analyze.analysis.sprite.frames).toBeGreaterThan(0);
    expect(existsSync(parsed.result.normalize.outputFile)).toBe(true);
    expect(parsed.result.export.generated.length).toBeGreaterThan(0);
  });
});
