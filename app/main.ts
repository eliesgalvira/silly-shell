import { createInterface } from "readline";
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.setPrompt("$ ");
rl.prompt();

rl.on("line", (line) => {
  const command = line.trim();
  const commandFields = command.split(" ");
  const commandName = commandFields[0];
  const commandArgs = commandFields.slice(1);

  if (command === "exit 0") {
    process.exit(0);
  }

  if (commandName) {
    console.log(`${commandName}: not found`);
  }
  rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});
