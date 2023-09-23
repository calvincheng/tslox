import Interpreter, { LoxObject } from "./Interpreter";

export default interface LoxCallable {
  arity: () => number;
  call: (interpreter: Interpreter, args: LoxObject[]) => LoxObject;
}

/** A user type-guard to see if an object implements an interface.
 *  (It's also a pretty jank... why is there no keyword for this in TypeScript?)
 */
export function isLoxCallable(obj: any): obj is LoxCallable {
  return obj.call !== undefined && obj.arity !== undefined;
}
