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
  enclosing: Environment | null;
  private values = new Map<String, LoxObject>();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing ?? null;
  }

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

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      // We force cast with ! because we assume that the resolver had already
      // found the enclosing environment before.
      environment = environment.enclosing!;
    }
    return environment;
  }

  /**
   * Look up a variable.
   */
  get(name: Token): LoxObject {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }
    if (this.enclosing) {
      return this.enclosing.get(name);
    }
    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }

  assign(name: Token, value: LoxObject) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }
    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }
    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }

  /**
   * Fetches a variable's value from an environment at `distance` steps away
   * from the current scope. Throws an error if the variable isn't found.
   */
  getAt(distance: number, name: Token): LoxObject {
    let object = this.ancestor(distance).values.get(name.lexeme);
    if (object !== undefined) return object;
    throw new RuntimeError(
      name,
      `Failed to get variable ${name.lexeme} from an environment ${distance} steps away. Did the resolver fail?`
    );
  }

  /**
   * Assigns a value to a variable at an environment at `distance` steps away
   * from the current scope.
   */
  assignAt(distance: number, name: Token, value: LoxObject) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }
}
