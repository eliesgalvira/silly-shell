import { type ResolvedCommand } from "../types.js";
import { isBuiltin } from "../utils.js";
import { findExecutableInPath } from "../utils.js";

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
