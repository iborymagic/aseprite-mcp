import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

export interface SafePathOptions {
  mustExist?: boolean;
  createDirIfNeeded?: boolean;
}

export function normalizePath(p: string): string {
  if (!p || typeof p !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  return path.resolve(p);
}

export function mkdirSafe(dir: string) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (err) {
    throw new Error(`Failed to create directory: ${dir}`);
  }
}

export function ensureSafePath(p: string, options: SafePathOptions = {}) {
  const absPath = normalizePath(p);
  const parentDir = path.dirname(absPath);

  if (options.mustExist) {
    if (!existsSync(absPath)) {
      throw new Error(`File does not exist: ${absPath}`);
    }

    const stat = statSync(absPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${absPath}`);
    }
  }

  if (options.createDirIfNeeded) {
    mkdirSafe(parentDir);
  }

  return absPath;
}