import Token from "./Token";
import { TokenType } from "./TokenType";
import { LoxError } from "./ErrorHandler";

export default class Scanner {
  private source: string;
  private tokens: Token[] = [];

  private start = 0; // Index of first character in the lexeme being scanned
  private current = 0; // Index of current character being considered
  private line = 1; // Line number `current` is on

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
      default:
        throw new LoxError(`Unexpected character '${c}'.`, this.line);
    }
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

  private addTokenWithLiteral(type: TokenType, literal: string | null): void {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}
