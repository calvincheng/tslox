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

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
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
}
