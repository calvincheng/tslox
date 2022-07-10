import fs from "fs";
import readline from "node:readline";
import Scanner from "./Scanner";
import { readLine } from "./utils";

class Lox {
  hadError: boolean = false;

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

    // Indicate an error in the exit code
    if (this.hadError) process.exit(65);
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
      this.hadError = false;
    }
  }

  private run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    tokens.forEach(console.log);
  }

  error(line: number, message: string): void {
    this.report(line, "", message);
  }

  private report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error${where}: ${message}`);
    this.hadError = true;
  }
}

new Lox();
