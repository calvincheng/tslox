/**
 * INTERPRETER
 * ~~~~~~~~~~~
 *
 */

import { Expr, Literal, Grouping, Unary, Binary, Visitor } from "../src/Ast";
import { TokenType } from "./TokenType";
import Token from "./Token";
import { RuntimeError } from "./ErrorHandler";

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
        this.checkNumberOperand(expr.operator, right);
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
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (left instanceof Number && right instanceof Number) {
          return Number(left) + Number(right);
        }
        if (left instanceof String && right instanceof String) {
          return String(left) + String(right);
        }
        throw new RuntimeError(
          expr.operator,
          "Operands must be two numbers or two strings."
        );
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) / Number(right);
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) > Number(right);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) >= Number(right);
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) < Number(right);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) <= Number(right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    // Unreachable
    return null;
  }

  // Private methods -- evaluation

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

  // Private methods -- detecting runtime errors

  private checkNumberOperand(operator: Token, operand: LoxObject) {
    if (operand instanceof Number) return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: LoxObject,
    right: LoxObject
  ) {
    if (left instanceof Number && right instanceof Number) return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }
}
