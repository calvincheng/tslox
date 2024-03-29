import fs from "fs";
import readline from "node:readline";
import Scanner from "./Scanner";
import Interpreter from "./Interpreter";
import { Parser } from "./Parser";
import Resolver from "./Resolver";
import ErrorHandler from "./ErrorHandler";
import { readLine } from "./utils";

class Lox {
  errorHandler = new ErrorHandler();
  private interpreter = new Interpreter((err) => this.errorHandler.report(err));

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
    if (this.errorHandler.hadRuntimeError) process.exit(70);
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
        this.errorHandler.report(err as Error);
      }
      this.errorHandler.hadError = false;
      this.errorHandler.hadRuntimeError = false;
    }
  }

  private run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens, (err) => this.errorHandler.report(err));
    const statements = parser.parse();

    const resolver = new Resolver(this.interpreter, (err) =>
      this.errorHandler.report(err)
    );
    resolver.resolveStmts(statements);

    // Stop if there was a syntax or resolver error
    if (this.errorHandler.hadError) return;

    this.interpreter.interpret(statements);
  }
}

const filename = process.argv[2] ?? null;
new Lox(filename);
