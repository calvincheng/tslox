import Interpreter, { LoxObject } from "./Interpreter";
import LoxCallable from "./LoxCallable";
import LoxInstance from "./LoxInstance";

export default class LoxClass implements LoxCallable {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  toString(): string {
    return this.name;
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const instance: LoxInstance = new LoxInstance(this);
    return instance;
  }

  arity(): number {
    return 0;
  }
}
