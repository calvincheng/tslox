import fs from "fs";
import readline from "node:readline";
import Scanner from "./Scanner";
import { readLine } from "./utils";

class Lox {
  constructor(source?: string) {
    if (source) {
      this.runFile(source);
    } else {
      this.runPrompt();
    }
  }

  private runFile(path: string): void {
    const bytes: Buffer = fs.readFileSync(path);
    this.run(bytes.toString());
  }

  /**
   * Runs lox in an interactive prompt (REPL)
   * ---
   * REPL := Read, Evaluate, Print, Loop
   */
  private async runPrompt(): Promise<void> {
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

  private run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    tokens.forEach(console.log);
  }
}

new Lox();
