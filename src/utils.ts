import { builtins, type Builtins } from "./types.js";
import { existsSync, accessSync, constants } from "fs";
import { join, delimiter, isAbsolute } from "path";

const builtinValues: Set<string> = new Set(Object.values(builtins));

// Type guard
export const isBuiltin = (command: string): command is Builtins => {
  return builtinValues.has(command);
}

// Searches for an executable in the system PATH, stop at the first executable match
export const findExecutableInPath = (command: string): string | null => {
  const pathEnv = process.env.PATH ?? "";
  const directories = pathEnv.split(delimiter);

  for (const dir of directories) {
    // Optional: skip empty entries (e.g., from trailing delimiters)
    // and malformed non-absolute paths (isAbsolute is a cheap string check)
    // avoids unnecessary join and existsSync calls
    if (!dir || !isAbsolute(dir)) {
      continue;
    }

    const fullPath = join(dir, command);

    if (!existsSync(fullPath)) {
      continue;
    }

    try {
      // Check if file has execute permissions
      accessSync(fullPath, constants.X_OK);

      return fullPath;
    } catch {
      // accessSync throws if no execute permission, continue to next dir
      continue;
    }
  }

  return null;
};
