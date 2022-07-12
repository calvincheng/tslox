/**
 * "...It’s good engineering practice to separate the code that generates the
 * errors from the code that reports them." -- Robert Nystrom
 *
 * from Crafting Interpreters, Section 4.1.1 (Error handling)
 */

export class LoxError {
  message: string;
  line?: number;
  where?: string;

  constructor(message: string, line?: number, where?: string) {
    this.message = message;
    this.line = line;
    this.where = where || "";
  }
}

export default class ErrorHandler {
  hadError = false;

  report(err: LoxError): void {
    console.log(`[line ${err.line}] Error${err.where}: ${err.message}`);
    this.hadError = true;
  }
}
