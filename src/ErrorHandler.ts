/**
 * "...It’s good engineering practice to separate the code that generates the
 * errors from the code that reports them." -- Robert Nystrom
 *
 * from Crafting Interpreters, Section 4.1.1 (Error handling)
 */

import Token from "./Token";
import { TokenType } from "./TokenType";
import { LoxObject } from "./Interpreter";

export class Error {}

export class LoxError extends Error {
  message: string;
  line?: number;
  where?: string;

  constructor(message: string, line?: number, where?: string) {
    super();
    this.message = message;
    this.line = line;
    this.where = where || "";
  }
}

export class ParseError extends Error {
  message: string;
  line?: number;
  token: Token;

  constructor(token: Token, message: string, line?: number) {
    super();
    this.token = token;
    this.message = message;
    this.line = line;
  }
}

export class RuntimeError extends Error {
  message: string;
  line?: number;
  token: Token;

  constructor(token: Token, message: string, line?: number) {
    super();
    this.token = token;
    this.message = message;
    this.line = line;
  }
}

export class ReturnValue extends Error {
  value: LoxObject;

  constructor(value: LoxObject) {
    super();
    this.value = value;
  }
}

export default class ErrorHandler {
  hadError = false;
  hadRuntimeError = false;

  report(err: any): void {
    if (err instanceof ParseError) this.reportParseError(err);
    else if (err instanceof LoxError) this.reportLoxError(err);
    else if (err instanceof RuntimeError) this.reportRuntimeError(err);

    if (err instanceof ParseError || err instanceof LoxError) {
      this.hadError = true;
    } else if (err instanceof RuntimeError) {
      this.hadRuntimeError = true;
    }
  }

  private reportLoxError(err: LoxError): void {
    console.log(`[line ${err.line}] Error${err.where}: ${err.message}`);
  }

  private reportParseError(err: ParseError): void {
    if (err.token.type === TokenType.EOF) {
      console.log(`[line ${err.line}] Error at end: ${err.message}`);
    } else {
      console.log(
        `[line ${err.line}] Error at '${err.token.lexeme}': ${err.message}`
      );
    }
  }

  private reportRuntimeError(err: RuntimeError): void {
    console.log(`[line ${err.token.line}] ${err.message}`);
  }
}
