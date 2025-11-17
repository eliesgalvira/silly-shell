import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const repl = () => {
  rl.question("$ ", (command) => {
    console.log(`${command}: command not found`);
    repl();
  });
}

repl();
