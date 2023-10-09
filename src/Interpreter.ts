/**
 * INTERPRETER
 * ~~~~~~~~~~~
 *
 */

import {
  Expr,
  Literal,
  Logical,
  Grouping,
  Unary,
  Call,
  Binary,
  Variable,
  Assign,
  ExprVisitor,
  Stmt,
  Print,
  Return,
  Expression,
  Var,
  Function,
  Block,
  If,
  While,
  Class,
  Get,
  Set,
  This,
  StmtVisitor,
} from "../src/Ast";
import { TokenType } from "./TokenType";
import Token from "./Token";
import { RuntimeError, ReturnValue } from "./ErrorHandler";
import Environment from "./Environment";
import LoxCallable, { isLoxCallable } from "./LoxCallable";
import LoxFunction from "./LoxFunction";
import LoxClass from "./LoxClass";
import LoxInstance from "./LoxInstance";

export type LoxObject = Object | null;

export default class Interpreter
  implements ExprVisitor<LoxObject>, StmtVisitor<void>
{
  globals: Environment = new Environment();
  private environment: Environment = this.globals;
  private locals = new Map<Expr, number>();

  private onError: (err: RuntimeError) => void;

  constructor(onError: (err: RuntimeError) => void) {
    this.onError = onError;

    // Define 'clock' native function
    this.globals.define("clock", {
      arity() {
        return 0;
      },
      call(interpreter: Interpreter, args: LoxObject[]) {
        return Date.now() / 1000;
      },
      toString() {
        return "<native fn>";
      },
    } as LoxCallable);
  }

  /**
   * Convert the Literal tree node into a runtime value.
   */
  visitLiteralExpr(expr: Literal): LoxObject {
    return expr.value;
  }

  /**
   * Evaluate a logical expression, short-circuiting if needed.
   */
  visitLogicalExpr(expr: Logical): LoxObject {
    const left: LoxObject = this.evaluate(expr.left);
    // Short-circuit by returning left expression as soon as condition fails
    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }
    return this.evaluate(expr.right);
  }

  visitSetExpr(expr: Set): LoxObject {
    const object: LoxObject = this.evaluate(expr.object);
    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }
    const value: LoxObject = this.evaluate(expr.value);
    (object as LoxInstance).set(expr.name, value);
    return value;
  }

  visitThisExpr(expr: This): LoxObject {
    return this.lookUpVariable(expr.keyword, expr);
  }

  /**
   * Recursively evaluate subexpression in grouping and return it.
   */
  visitGroupingExpr(expr: Grouping): LoxObject {
    return this.evaluate(expr.expression);
  }

  /**
   * Evaluate the operand expression and apply the unary operator to the result.
   */
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

  /**
   * Evaluate the operand expressions and apply the binary operator to the result.
   * The operands are evaluated in in left-to-right order, so any side-effects
   * will apply in that order as well.
   */
  visitBinaryExpr(expr: Binary): LoxObject {
    const left: LoxObject = this.evaluate(expr.left);
    const right: LoxObject = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }
        if (typeof left === "string" && typeof right === "string") {
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

  /**
   * Evaluate a function call expression.
   */
  visitCallExpr(expr: Call): LoxObject {
    const callee: LoxObject = this.evaluate(expr.callee);
    const args: LoxObject[] = [];
    for (let arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    if (!isLoxCallable(callee)) {
      throw new RuntimeError(expr.paren, "Can only call functions and classes");
    }

    const func: LoxCallable = callee as LoxCallable;
    if (args.length != func.arity()) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${func.arity()} arguments but got ${args.length}.`
      );
    }
    return func.call(this, args);
  }

  /**
   * Evaluates a get expression.
   */
  visitGetExpr(expr: Get): LoxObject {
    const object: LoxObject = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return (object as LoxInstance).get(expr.name);
    }
    throw new RuntimeError(expr.name, "Only instances have properties.");
  }

  /**
   * Evaluate a variable expression.
   */
  visitVariableExpr(expr: Variable): LoxObject {
    return this.lookUpVariable(expr.name, expr);
  }

  visitAssignExpr(expr: Assign): LoxObject {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }
    return value;
  }

  visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  visitFunctionStmt(stmt: Function) {
    const func: LoxFunction = new LoxFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, func);
    return null;
  }

  visitIfStmt(stmt: If) {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else {
      if (stmt.elseBranch) {
        this.execute(stmt.elseBranch);
      }
    }
  }

  visitPrintStmt(stmt: Print) {
    let value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  visitReturnStmt(stmt: Return) {
    const value = stmt.value != null ? this.evaluate(stmt.value) : null;
    throw new ReturnValue(value);
  }

  visitVarStmt(stmt: Var) {
    const value =
      stmt.initialiser != null ? this.evaluate(stmt.initialiser) : null;
    this.environment.define(stmt.name.lexeme, value);
  }

  visitWhileStmt(stmt: While) {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitBlockStmt(stmt: Block) {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  visitClassStmt(stmt: Class) {
    // Define before assigning to allow classes to reference itself in its
    // methods
    this.environment.define(stmt.name.lexeme, null);

    const methods = new Map<string, LoxFunction>();
    for (let method of stmt.methods) {
      const func = new LoxFunction(
        method,
        this.environment,
        method.name.lexeme === "init"
      );
      methods.set(method.name.lexeme, func);
    }

    const klass: LoxClass = new LoxClass(stmt.name.lexeme, methods);
    this.environment.assign(stmt.name, klass);
  }

  // Public API

  /**
   * Takes in a syntax tree for an expression and evaluates it.
   * If it succeeds, convert it to a string and print it to the console.
   */
  interpret(statements: Stmt[]) {
    try {
      for (let statement of statements) {
        this.execute(statement);
      }
    } catch (err) {
      this.onError(err as RuntimeError);
    }
  }

  private stringify(object: LoxObject): string {
    // TODO: Verify that this matches Lox's stringify behaviour.
    // This is needed to hide the detail that Lox is implemented in TypeScript.
    if (object === null) return "nil";
    return object.toString();
  }

  // Private methods -- evaluation

  /**
   * Lox follows Ruby’s simple rule: false and nil are falsey, and everything
   * else is truthy.
   */
  private isTruthy(object: LoxObject): boolean {
    if (object == null) return false;
    if (typeof object === "boolean") return Boolean(object);
    return true;
  }

  private isEqual(a: LoxObject, b: LoxObject): boolean {
    // TODO: Verify that this matches Lox's equality behaviour.
    // This is needed to hide the detail that Lox is implemented in TypeScript.
    return a === b;
  }

  /**
   * Helper method that sends the expression back into the interpreter’s visitor
   * implementation.
   */
  private evaluate(expr: Expr): LoxObject {
    return expr.accept(this);
  }

  /**
   * Helper method that sends the statement back into the interpreter’s visitor
   * implementation.
   */
  private execute(stmt: Stmt) {
    return stmt.accept(this);
  }

  /**
   * Store the Resolver's results to be used at runtime.
   */
  resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  /**
   * Helper method that executes the statements contained within a block.
   * Statements are executed within its own lexical scope (a.k.a. environment).
   */
  executeBlock(statements: Stmt[], environment: Environment) {
    const previous: Environment = this.environment;
    try {
      this.environment = environment;
      for (let statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  // Private methods -- detecting runtime errors

  private checkNumberOperand(operator: Token, operand: LoxObject) {
    if (typeof operand === "number") return;
    throw new RuntimeError(operator, "Operand must be a number.");
  }

  private checkNumberOperands(
    operator: Token,
    left: LoxObject,
    right: LoxObject
  ) {
    if (typeof left === "number" && typeof right === "number") return;
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  // Private methods -- variable resolution

  /**
   * Look up local varaibles in the `locals` map.
   *
   * If found, we leverage the result of the Resolver's static analysis and
   * fetch it directly with `Environment.getAt`.
   * If it's not found, the variable must be global.
   */
  private lookUpVariable(name: Token, expr: Expr): LoxObject {
    if (this.locals.has(expr)) {
      const distance = this.locals.get(expr)!;
      return this.environment.getAt(distance, name);
    } else {
      return this.globals.get(name);
    }
  }
}
