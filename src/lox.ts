import fs from "fs";
import readline from "node:readline";
import Scanner from "./Scanner";
import ErrorHandler, { LoxError } from "./ErrorHandler";
import { readLine } from "./utils";

class Lox {
  errorHandler = new ErrorHandler();

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
    if (this.errorHandler.hadError) process.exit(65);
  }

  /**
   * Runs lox in an interactive prompt (REPL)
   * REPL: Read, Evaluate, Print, Loop
   */
  private async runPrompt(): Promise<void> {
    const input = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    while (true) {
      const line = await readLine(input, "> ");
      if (line === null) break;
      try {
        this.run(line);
      } catch (err) {
        this.errorHandler.report(err as LoxError);
      }
      this.errorHandler.hadError = false;
    }
  }

  private run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    tokens.forEach((token) => console.log(token));
  }
}

new Lox();
