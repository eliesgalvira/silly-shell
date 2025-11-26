import { createInterface } from "readline";
import { existsSync, accessSync, constants } from "fs";
import { join, delimiter } from "path";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtins = {
  ECHO: "echo",
  TYPE: "type",
  EXIT: "exit"
 } as const;

type Builtins = (typeof builtins)[keyof typeof builtins];

type ResolvedCommand =
  | { kind: "builtin"; name: Builtins }
  | { kind: "executable"; name: string; path: string }
  | { kind: "notFound"; name: string };

const builtinValues: Set<string> = new Set(Object.values(builtins));

// Type guard
const isBuiltin = (command: string): command is Builtins => {
  return builtinValues.has(command);
}

const commandHandlers:  Record<Builtins, (args: string[]) => void> = {
  [builtins.ECHO]: (args) => console.log(args.join(" ")),
  [builtins.TYPE]: (args) => typeBuiltin(args),
  [builtins.EXIT]: () => process.exit(0),
};

rl.setPrompt("$ ");
rl.prompt();

rl.on("line", (line) => {
  const command = line.trim();
  const commandFields = command.split(" ");
  const commandName = commandFields[0];
  const commandArgs = commandFields.slice(1);

  if (!command) {
    rl.prompt();
    return;
  }

  if (isBuiltin(commandName)) {
    commandHandlers[commandName](commandArgs);
  } else {
    console.log(`${commandName}: not found`);
  }

  rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});


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

const typeBuiltin = (args: string[]) => {
  args.map(findCommandType)
    .forEach((resolved) => {
      console.log(messageCommandType(resolved));
    });
}


// Searches for an executable in the system PATH, stop at the first executable match
const findExecutableInPath = (command: string): string | null => {
  const pathEnv = process.env.PATH ?? "";
  const directories = pathEnv.split(delimiter);

  for (const dir of directories) {
    // Optional skip empty entries (e.g., from trailing delimiters)
    // avoids unnecessary join and existsSync calls
    if (!dir) {
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
