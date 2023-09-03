/**
 * ENVIRONMENT
 * ~~~~~~~~~~~
 *
 * Stores the bindings that associate variables to values.
 */

import Token from "./Token";
import { RuntimeError } from "./ErrorHandler";

type LoxObject = Object | null;

export default class Environment {
  private values = new Map<String, LoxObject>();

  /**
   * Bind a variable to a value.
   */
  define(name: string, value: LoxObject) {
    // NOTE: When we add the key to the map, we don’t check to see if it’s
    // already present.
    //
    // So this would be valid:
    // var a = "before";
    // print a; // "before".
    // var a = "after";
    // print a; // "after".
    this.values.set(name, value);
  }

  /**
   * Look up a variable.
   */
  get(name: Token): LoxObject {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }
    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
