import { existsSync, readFileSync } from "node:fs";
import { createToolHandlers } from "../src/tools.js";

const TEST_ASSET = "test/assets/sample.aseprite";

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

const toolHandlers = createToolHandlers();

describe("Aseprite MCP tools", () => {
  it("should check environment", async () => {
    const result = await toolHandlers.aseprite_check_environment();
    const resultContent = result.content[0] as { text: string };
    const parsedResult = JSON.parse(resultContent.text);

    expectBaseResult(parsedResult);
    expect(parsedResult.success).toBe(true);
  });

  it("should export sheet", async () => {
    const result = await toolHandlers.aseprite_export_sheet({ 
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
    const result = await toolHandlers.aseprite_export_frames({ 
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
    const result = await toolHandlers.aseprite_export_metadata({ 
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