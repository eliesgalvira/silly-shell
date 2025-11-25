import { createInterface } from "readline";
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
  args.forEach((possibleBuiltin) => {
    if (builtinValues.has(possibleBuiltin)) {
      console.log(`${possibleBuiltin} is a shell builtin`);
    } else {
      console.log(`${possibleBuiltin}: not found`)
    }
  })
}
