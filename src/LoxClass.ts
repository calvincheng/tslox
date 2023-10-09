import Interpreter, { LoxObject } from "./Interpreter";
import LoxCallable from "./LoxCallable";
import LoxInstance from "./LoxInstance";
import LoxFunction from "./LoxFunction";

export default class LoxClass implements LoxCallable {
  name: string;
  private methods: Map<string, LoxFunction>;

  constructor(name: string, methods: Map<string, LoxFunction>) {
    this.name = name;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | null {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }
    return null;
  }

  toString(): string {
    return this.name;
  }

  call(interpreter: Interpreter, args: LoxObject[]): LoxObject {
    const instance: LoxInstance = new LoxInstance(this);
    const initialiser = this.findMethod("init");
    if (initialiser !== null) {
      initialiser.bind(instance).call(interpreter, args);
    }
    return instance;
  }

  arity(): number {
    const initialiser = this.findMethod("init");
    if (initialiser === null) return 0;
    return initialiser.arity();
  }
}
