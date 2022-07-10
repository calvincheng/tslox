import { TokenType } from "./TokenType";

export default class Token {
  type: TokenType;
  lexeme: string;
  literal: string;
  line: number;

  constructor(type: TokenType, lexeme: string, literal: string, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
