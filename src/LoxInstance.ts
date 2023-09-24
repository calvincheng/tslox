import LoxClass from "./LoxClass";
import { LoxObject } from "./Interpreter";
import Token from "./Token";
import { RuntimeError } from "./ErrorHandler";

export default class LoxInstance {
  private klass: LoxClass;
  private fields = new Map<string, LoxObject>();

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }

  get(name: Token): LoxObject {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }
    throw new RuntimeError(name, `Undefined property '${name.lexeme}'.`);
  }

  set(name: Token, value: LoxObject) {
    this.fields.set(name.lexeme, value);
  }
}
