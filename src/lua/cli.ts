import { AsepriteCommandResult, runAsepriteCommand } from "../aseprite/cli.js";
import { ensureSafePath } from "../aseprite/path.js";

export async function runLuaScriptFile(
  scriptPath: string,
  params: Record<string, unknown>
): Promise<AsepriteCommandResult> {
  const args = ["--batch"];

  if (typeof params.inputFile === "string") {
    const inputAbs = ensureSafePath(params.inputFile, { mustExist: true });
    args.push(`"${inputAbs}"`);
  }
  
  for (const [key, value] of Object.entries(params)) {
    if (key === "inputFile" || value == null) continue;
    args.push("--script-param", `${key}="${String(value)}"`);
  }
  
  args.push("--script", `"${scriptPath}"`);

  return runAsepriteCommand(args);
}