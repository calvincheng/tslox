/**
 * SCANNER
 * ~~~~~~~
 *
 * The scanner takes in raw source code as a series of characters and groups it
 * into a series of chunks we call tokens. These are the meaningful “words” and
 * “punctuation” that make up the language’s grammar.
 *
 */

import Token from "./Token";
import { TokenType } from "./TokenType";
import { LoxError } from "./ErrorHandler";

export default class Scanner {
  private source: string;
  private tokens: Token[] = [];

  private start = 0; // Index of first character in the lexeme being scanned
  private current = 0; // Index of current character being considered
  private line = 1; // Line number `current` is on

  // Set of reserved words
  private keywords: { [keyword: string]: TokenType } = {
    and: TokenType.AND,
    class: TokenType.CLASS,
    else: TokenType.ELSE,
    false: TokenType.FALSE,
    for: TokenType.FOR,
    fun: TokenType.FUN,
    if: TokenType.IF,
    nil: TokenType.NIL,
    or: TokenType.OR,
    print: TokenType.PRINT,
    return: TokenType.RETURN,
    super: TokenType.SUPER,
    this: TokenType.THIS,
    true: TokenType.TRUE,
    var: TokenType.VAR,
    while: TokenType.WHILE,
  };

  constructor(source: string) {
    this.source = source;
  }

  /**
   * Work through source code and add tokens until out of characters.
   * A final "end of file" token is appended to the end for cleanliness.
   */
  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  /**
   * The "heart of the scanner". Scans for a single token.
   */
  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      // Single character lexemes
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      // Operators
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case "/":
        if (this.match("/")) this.singleLineComment();
        else if (this.match("*")) this.blockComment();
        else this.addToken(TokenType.SLASH);
        break;
      // Whitespace
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line += 1;
        break;
      // String literals
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) this.number();
        else if (this.isAlpha(c)) this.identifier();
        else throw new LoxError(`Unexpected character '${c}'.`, this.line);
    }
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();
    const text = this.source.slice(this.start, this.current);
    const type = this.keywords[text] ?? TokenType.IDENTIFIER;
    this.addToken(type);
  }

  /**
   * Consumes characters until the terminating " is reached.
   * Multi-line strings are supported.
   * Running out of input before the string is closed throws an error.
   */
  private string(): void {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line += 1;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new LoxError("Unterminated string.", this.line);
    }

    // Consume the closing "
    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addTokenWithLiteral(TokenType.STRING, value);
  }

  /**
   * Consumes the characters of a number literal.
   * Handles both floating type and integer numbers.
   */
  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    // Handle decimal points - the . is only consumed if it is followed by a digit
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the .
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    const value = this.source.slice(this.start, this.current);
    this.addTokenWithLiteral(TokenType.NUMBER, Number(value));
  }

  /**
   * Consumes the characters of a single-line comment
   */
  private singleLineComment(): void {
    // Consume all characters in a comment until the end of the line
    while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
  }

  /**
   * Consumes the characters of a block comment.
   * Handles both single and multi-line blocks.
   * Unterminated block comments are allowed.
   */
  private blockComment(): void {
    while (this.peek() !== "*" && this.peekNext() !== "/" && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line += 1;
      this.advance();
    }

    // Consume the closing */
    this.advance();
    this.advance();
  }

  /**
   * A conditional variant of advance().
   * Only consumes the current character if it’s expected.
   */
  private match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current += 1;
    return true;
  }

  /**
   * Performs a one-character lookahead.
   * Identifies the next character without consuming it.
   */
  private peek(): string {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }

  /**
   * Performs a two-character lookahead.
   * Identifies 2 characters ahead without consuming it.
   */
  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  /**
   * Checks if a character is a digit
   */
  private isDigit(c: string): boolean {
    return /^[0-9]{1}$/.test(c);
  }

  /**
   * Checks if a character is a letter or an underscore
   */
  private isAlpha(c: string): boolean {
    return /^[a-zA-Z_]{1}$/.test(c);
  }

  /**
   * Checks if a character is alphanumeric
   */
  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  /**
   * Helper function that indicates if all characters have been consumed
   */
  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  /**
   * Consumes the next character in the source file and returns it.
   * Used for input.
   */
  private advance(): string {
    const char = this.source.charAt(this.current);
    this.current += 1;
    return char;
  }

  /**
   * Grab the text of the current lexeme and create a token for it.
   */
  private addToken(type: TokenType): void {
    this.addTokenWithLiteral(type, null);
  }

  private addTokenWithLiteral(type: TokenType, literal: any): void {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}
