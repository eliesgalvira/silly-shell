import { existsSync, accessSync, constants } from "fs";
import { join, delimiter, isAbsolute } from "path";
import { type ResolvedCommand } from "../types.js";
import { isBuiltin } from "../utils.js";

export const typeBuiltin = (args: string[]) => {
  args.map(findCommandType)
    .forEach((resolved) => {
      console.log(messageCommandType(resolved));
    });
}

const findCommandType = (command: string): ResolvedCommand => {
  if (isBuiltin(command)) {
    return { kind: "builtin", name: command };
  }

  const executablePath = findExecutableInPath(command);
  if (executablePath) {
    return { kind: "executable", name: command, path: executablePath };
  }

  return { kind: "notFound", name: command };
};

const messageCommandType = (resolved: ResolvedCommand): string => {
  if (resolved.kind === "builtin") {
    return `${resolved.name} is a shell builtin`;
  }

  if (resolved.kind === "executable") {
    return `${resolved.name} is ${resolved.path}`;
  }

  return `${resolved.name}: not found`;
};

// Searches for an executable in the system PATH, stop at the first executable match
const findExecutableInPath = (command: string): string | null => {
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
