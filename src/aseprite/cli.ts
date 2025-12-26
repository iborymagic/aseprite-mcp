import { exec } from "node:child_process";
import { promisify } from "node:util";
import { resolveAsepritePath } from "./env.js";

export interface AsepriteCommandResult {
  command: string;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

const execAsync = promisify(exec);

export async function runAsepriteCommand(args: string[], timeout: number = 10_000): Promise<AsepriteCommandResult> {
  const path = await resolveAsepritePath();
  const command = `"${path}" ${args.join(" ")}`;

  try {
    const { stdout, stderr } = await execAsync(command, { timeout });
    return { command, stdout, stderr, timedOut: false };
  } catch (error: any) {
    if (error.killed === true && error.code === null) {
      return { 
        command, 
        stdout: "", 
        stderr: "Aseprite command timed out", 
        timedOut: true 
      };
    }

    throw new Error(
      `Failed to run Aseprite command: ${command}\n${error instanceof Error ? error.message : String(error)}`
    );
  }
}