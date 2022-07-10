import fs from "fs";
import readline from "node:readline";
import Scanner from "./Scanner";

function readLine(input: any, prompt = "") {
  return new Promise<string | null>((rsov) => {
    input.question(prompt, (line: string | null) => rsov(line));
  });
}

class Lox {
  constructor(source?: string) {
    if (source) {
      this.runFile(source);
    } else {
      this.runPrompt();
    }
  }

  runFile(path: string): void {
    const bytes: Buffer = fs.readFileSync(path);
    this.run(bytes.toString());
  }

  /**
   * Runs lox in an interactive prompt (REPL)
   * ---
   * REPL := Read, Evaluate, Print, Loop
   */
  async runPrompt(): Promise<void> {
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    while (true) {
      const line = await readLine(input, "> ");
      if (line === null) break;
      this.run(line);
    }
  }

  run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    tokens.forEach(console.log);
  }
}

new Lox();
