/**
 * INTERPRETER
 * ~~~~~~~~~~~
 *
 */

import { Expr, Literal, Grouping, Unary, Binary, Visitor } from "../src/Ast";
import { TokenType } from "./TokenType";

type LoxObject = Object | null;

export class Interpreter implements Visitor<LoxObject> {
  visitLiteralExpr(expr: Literal): LoxObject {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): LoxObject {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Unary): LoxObject {
    const right: LoxObject = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -Number(right);
    }

    // Unreachable
    return null;
  }

  visitBinaryExpr(expr: Binary): LoxObject {
    const left: LoxObject = this.evaluate(expr.left);
    const right: LoxObject = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (left instanceof Number && right instanceof Number) {
          return Number(left) + Number(right);
        }
        if (left instanceof String && right instanceof String) {
          return String(left) + String(right);
        }
        break;
      case TokenType.STAR:
        return Number(left) * Number(right);
      case TokenType.SLASH:
        return Number(left) / Number(right);
      case TokenType.GREATER:
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        return Number(left) >= Number(right);
      case TokenType.LESS:
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    // Unreachable
    return null;
  }

  private isTruthy(object: LoxObject): boolean {
    if (object == null) return false;
    if (object instanceof Boolean) return Boolean(object);
    return true;
  }

  private isEqual(a: LoxObject, b: LoxObject): boolean {
    // TODO: Match Lox equality behaviour
    // Currently follows TypeScript's strict equality (===)
    return a === b;
  }

  private evaluate(expr: Expr): LoxObject {
    return expr.accept(this);
  }
}
