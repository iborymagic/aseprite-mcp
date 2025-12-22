import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolveAsepritePath } from "./env.js";

export interface AsepriteCommandResult {
  command: string;
  stdout: string;
  stderr: string;
}

const execAsync = promisify(exec);

export async function runAsepriteCommand(args: string[]): Promise<AsepriteCommandResult> {
  const path = await resolveAsepritePath();
  const command = `"${path}" ${args.join(" ")}`;

  try {
    const { stdout, stderr } = await execAsync(command);
    return { command, stdout, stderr };
  } catch (error: unknown) {
    throw new Error(
      `Failed to run Aseprite command: ${command}\n${error instanceof Error ? error.message : String(error)}`
    );
  }
}