export const builtins = {
  ECHO: "echo",
  TYPE: "type",
  EXIT: "exit"
 } as const;

export type Builtins = (typeof builtins)[keyof typeof builtins];


export type ResolvedCommand =
  | { kind: "builtin"; name: Builtins }
  | { kind: "executable"; name: string; path: string }
  | { kind: "notFound"; name: string };
