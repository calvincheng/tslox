import LoxCallable from "./LoxCallable";
import Interpreter, { LoxObject } from "./Interpreter";
import { Function } from "./Ast";
import Environment from "./Environment";
import { ReturnWrapper } from "./ErrorHandler";

export default class LoxFunction implements LoxCallable {
  private declaration: Function;

  constructor(declaration: Function) {
    this.declaration = declaration;
  }

  call(interpreter: Interpreter, args: LoxObject[]) {
    const environment: Environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i += 1) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof ReturnWrapper) {
        let returnValue = err;
        return returnValue.value;
      }
      throw err;
    }
    return null;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
