import LoxClass from "./LoxClass";

export default class LoxInstance {
  private klass: LoxClass;

  constructor(klass: LoxClass) {
    this.klass = klass;
  }

  toString(): string {
    return `${this.klass.name} instance`;
  }
}
