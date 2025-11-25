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


const typeBuiltin = (args: string[]) => {
  args.forEach((arg) => {
    if (builtinValues.has(arg)) {
      console.log(`${arg} is a shell builtin`);
    } else {
      const executablePath = findExecutableInPath(arg);

      if (executablePath) {
        console.log(`${arg} is ${executablePath}`);
      } else {
        console.log(`${arg}: not found`);
      }
    }
  })
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
