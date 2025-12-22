import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function runAsepriteCommand(cmd: string) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return { stdout, stderr };
  } catch (error: unknown) {
    throw new Error(
      `Failed to run Aseprite command: ${cmd}\n${error instanceof Error ? error.message : String(error)}`
    );
  }
}