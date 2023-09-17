import Interpreter, { LoxObject } from "./Interpreter";

export default interface LoxCallable {
  call: (interpreter: Interpreter, args: LoxObject[]) => LoxObject;
}
