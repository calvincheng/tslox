/**
 * PARSER
 * ~~~~~~
 *
 * A parser really has two jobs:
 * 
 * 1. Given a valid sequence of tokens, produce a corresponding syntax tree.
 * 2. Given an invalid sequence of tokens, detect any errors and tell the user
 *    about their mistakes.
 *
 */

import Token from "./Token";
import { TokenType } from "./TokenType";
import { Expr, Binary, Grouping, Literal, Unary } from "./Ast";
import { ParseError } from "./ErrorHandler";

export class Parser {
  private tokens: Token[];
  private current = 0;
  private onError: (err: ParseError) => void;

  constructor(tokens: Token[], onError: (err: ParseError) => void) {
    this.tokens = tokens;
    this.onError = onError;
  }

  /**
   * Parse the provided tokens and return a valid expression (i.e. syntax tree).
   * Returns null in case of an error.
   */
  parse(): Expr | null {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  /**
   * Implements the following grammar production:
   * expression → equality ;
   */
  private expression(): Expr {
    return this.equality();
  }

  /**
   * Implements the following grammar production:
   * equality → comparison ( ( "!=" | "==" ) comparison )* ;
   */
  private equality(): Expr {
    let expr: Expr = this.comparison();
    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator: Token = this.previous();
      const right: Expr = this.comparison();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  /**
   * Implements the following grammar production:
   * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
   */
  private comparison(): Expr {
    let expr: Expr = this.term();
    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      let operator: Token = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }


  /**
   * Implements the following grammar production:
   * term → factor ( ( "-" | "+" ) factor )* ;
   */
  private term(): Expr {
    let expr: Expr = this.factor();
    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      let operator: Token = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }


  /**
   * Implements the following grammar production:
   * factor → unary ( ( "/" | "*" ) unary )* ;
   */
  private factor(): Expr {
    let expr: Expr = this.unary();
    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      let operator: Token = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }
    return expr;
  }

  /**
   * Implements the following grammar production:
   * unary → ( "!" | "-" ) unary
   *                | primary ;
   */
  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator: Token = this.previous();
      const right: Expr = this.unary();
      return new Unary(operator, right);
    }
    return this.primary();
  }


  /**
   * Implements the following grammar production:
   * primary → NUMBER | STRING | "true" | "false" | "nil" 
   *           | "(" expression ")" ;
   */
  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      const expr: Expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }
    throw this.error(this.peek(), "Expect expression.");
  }


  /**
   * Check to see if the current token has any of the given types.
   * If it does, consume it and return true.
   * Otherwise, do nothing and return false.
   */
  private match(...types: TokenType[]): boolean {
    for (let type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  /**
   * Checks to see if the next token is of the expected type.
   * If so, consume it. Otherwise, report an error
   */
  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  /**
   * Return true if the current token is of the given type.
   */
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  /**
   * Consume the current token and return it.
   */
  private advance(): Token {
    if (!this.isAtEnd()) this.current += 1;
    return this.previous();
  }

  /**
   * Check if we've run out of tokens to parse.
   */
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  /**
   * Return the current token to be consumed.
   */
  private peek(): Token {
    return this.tokens[this.current];
  }

  /**
   * Return the most recently consumed token.
   */
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  /**
   * This reports an error at a given token, showing the token’s location and
   * the token itself. The error is returned instead of thrown to let the
   * calling method inside the parser decide whether to unwind or not.
   */
  private error(token: Token, message: string): ParseError {
    const parseError = new ParseError(token, message, 1);
    this.onError(parseError);
    return parseError;
  }

  private synchronise(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}
