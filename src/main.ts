import { createInterface } from "readline";
import { spawn } from "node:child_process";
import { builtins, type Builtins } from "./types.js";
import { isBuiltin } from "./utils.js";
import { typeBuiltin } from "./builtins/type.js";
import { findExecutableInPath } from "./utils.js";

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

rl.on("line", async (line) => {
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
    rl.prompt();
    return;
  }

  const executablePath = findExecutableInPath(commandName);
  if (executablePath) {
    const proc = spawn(executablePath, commandArgs, {
      stdio: "inherit",
      argv0: commandName,
    });

    proc.on("close", () => {
      rl.prompt();
    });
    return;
  }

  console.log(`${commandName}: not found`);

  rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});
