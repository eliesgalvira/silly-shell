import { createInterface } from "readline";
import { builtins, type Builtins } from "./types.js";
import { isBuiltin } from "./utils.js";
import { typeBuiltin } from "./builtins/type.js";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
