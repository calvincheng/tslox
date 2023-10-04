import LoxCallable from "./LoxCallable";
import LoxInstance from "./LoxInstance";
import Interpreter, { LoxObject } from "./Interpreter";
import { Function } from "./Ast";
import Environment from "./Environment";
import { RuntimeError, ReturnValue } from "./ErrorHandler";

export default class LoxFunction implements LoxCallable {
  private declaration: Function;
  private closure: Environment;
  private isInitialiser: boolean;
  private instance?: LoxInstance;

  constructor(
    declaration: Function,
    closure: Environment,
    isInitialiser: boolean,
    instance?: LoxInstance
  ) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitialiser = isInitialiser;
    this.instance = instance;
  }

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(
      this.declaration,
      environment,
      this.isInitialiser,
      instance
    );
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const environment: Environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i += 1) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }
    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (err) {
      if (err instanceof ReturnValue) {
        let returnValue = err;
        // Empty returns in init() returns `this` (the instance)
        if (this.isInitialiser) return this.instance!;
        return returnValue.value;
      }
      throw err;
    }
    // init() always return `this` (the instance), even when directly called
    if (this.isInitialiser) return this.instance!;
    return null;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}
