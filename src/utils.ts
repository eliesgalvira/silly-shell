import { builtins, type Builtins } from "./types.js";

const builtinValues: Set<string> = new Set(Object.values(builtins));

// Type guard
export const isBuiltin = (command: string): command is Builtins => {
  return builtinValues.has(command);
}
