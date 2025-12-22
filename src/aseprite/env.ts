import { existsSync, readFileSync } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import * as os from "node:os";
import * as path from "node:path";

const execAsync = promisify(exec);

const candidates = {
  win32: [
    "C:\\Program Files\\Aseprite\\aseprite.exe",
    "C:\\Program Files (x86)\\Aseprite\\aseprite.exe",
  ],
  darwin: [
    "/Applications/Aseprite.app/Contents/MacOS/aseprite",
    "/usr/local/bin/aseprite",
    "/opt/homebrew/bin/aseprite",
  ],
  linux: [
    "/usr/bin/aseprite",
    "/usr/local/bin/aseprite",
  ]
};

function getSteamVdfPaths(): string[] {
  switch (process.platform) {
    case "win32":
      return [
        path.join(
          process.env.PROGRAMFILESX86 ??
            "C:\\Program Files (x86)",
          "Steam/steamapps/libraryfolders.vdf"
        ),
        path.join(
          process.env.PROGRAMFILES ??
            "C:\\Program Files",
          "Steam/steamapps/libraryfolders.vdf"
        )
      ];

    case "darwin":
      return [
        path.join(
          os.homedir(),
          "Library/Application Support/Steam/steamapps/libraryfolders.vdf"
        )
      ];

    default:
      // linux
      return [
        path.join(
          os.homedir(),
          ".steam/steam/steamapps/libraryfolders.vdf"
        ),
        path.join(
          os.homedir(),
          ".local/share/Steam/steamapps/libraryfolders.vdf"
        )
      ];
  }
}

function parseSteamLibraries(vdfContent: string): string[] {
  const lines = vdfContent.split("\n");

  const paths: string[] = [];

  for (const line of lines) {
    const match = line.match(/"(\d+)"\s+"(.+?)"/);
    if (match) {
      let p = match[2];
      if (process.platform === "win32") {
        p = p.replace(/\\\\/g, "\\");
      }
      paths.push(p);
    }

    // libraryfolders 2.0
    const kvMatch = line.match(/"path"\s+"(.+?)"/);
    if (kvMatch) {
      let p = kvMatch[1];
      if (process.platform === "win32") {
        p = p.replace(/\\\\/g, "\\");
      }
      paths.push(p);
    }
  }

  return Array.from(new Set(paths));
}

export function getSteamAsepritePaths(): string[] {
  const files = getSteamVdfPaths();

  for (const file of files) {
    if (!existsSync(file)) continue;

    try {
      const content = readFileSync(file, "utf8");
      const libs = parseSteamLibraries(content);

      const paths: string[] = [];

      for (const lib of libs) {
        switch (process.platform) {
          case "win32":
            paths.push(
              path.join(
                lib,
                "steamapps/common/Aseprite/aseprite.exe"
              )
            );
            break;
          case "darwin":
            paths.push(
              path.join(
                lib,
                "steamapps/common/Aseprite/Aseprite.app/Contents/MacOS/aseprite"
              )
            );
            break;
          default: // linux
            paths.push(
              path.join(
                lib,
                "steamapps/common/Aseprite/aseprite"
              )
            );
            break;
        }
      }

      return paths;
    } catch {
      continue;
    }
  }

  return [];
}

export async function resolveAsepritePath() {
  try {
    const platform = process.platform;
    const cmd = platform === "win32" ? "where aseprite" : "which aseprite";
    const { stdout } = await execAsync(cmd);
    const found = stdout.split("\n")[0].trim();
    if (found && existsSync(found)) return found;
  } catch {}

  const defaults =
    candidates[process.platform as keyof typeof candidates] ??
    [];

  for (const path of defaults) {
    if (existsSync(path)) return path;
  }

  const steamPaths = getSteamAsepritePaths();
  for (const path of steamPaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  throw new Error(
    `Aseprite not found. Please install it or add to PATH.\nDetected OS: ${process.platform}`
  );
}
