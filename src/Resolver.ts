/**
 * RESOLVER
 * ~~~~~~~~
 *
 * Performs variable resolution over the abstract syntax tree.
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
  StmtVisitor,
} from "../src/Ast";
import Interpreter from "./Interpreter";
import Token from "./Token";
import Stack from "./Stack";
import { ResolverError } from "./ErrorHandler";

type VariableName = string;

export enum FunctionType {
  NONE = "NONE",
  FUNCTION = "FUNCTION",
}

export default class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private interpreter: Interpreter;
  private scopes: Stack<Map<VariableName, Boolean>> = new Stack();
  private currentFunc: FunctionType = FunctionType.NONE;

  private onError: (err: ResolverError) => void;

  constructor(interpreter: Interpreter, onError: (err: ResolverError) => void) {
    this.interpreter = interpreter;
    this.onError = onError;
  }

  visitBlockStmt(stmt: Block) {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
    return null;
  }

  visitClassStmt(stmt: Class) {
    this.declare(stmt.name);
    this.define(stmt.name);
  }

  visitExpressionStmt(stmt: Expression) {
    this.resolveExpr(stmt.expression);
  }

  visitFunctionStmt(stmt: Function) {
    this.declare(stmt.name);
    // Define immediately to allow recursive functions to refer to itself
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  visitIfStmt(stmt: If) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch !== null) {
      this.resolveStmt(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Print) {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: Return) {
    if (this.currentFunc == FunctionType.NONE) {
      throw new ResolverError(
        stmt.keyword,
        "Can't return from top-level code."
      );
    }
    if (stmt.value !== null) {
      this.resolveExpr(stmt.value);
    }
  }

  visitWhileStmt(stmt: While) {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
  }

  visitVarStmt(stmt: Var) {
    this.declare(stmt.name);
    if (stmt.initialiser != null) {
      this.resolveExpr(stmt.initialiser);
    }
    this.define(stmt.name);
  }

  visitAssignExpr(expr: Assign) {
    // Resolve assigned value in case it contains references to other variables
    this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: Binary) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: Call) {
    this.resolveExpr(expr.callee);
    for (let arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitGetExpr(expr: Get) {
    this.resolveExpr(expr.object);
  }

  visitGroupingExpr(expr: Grouping) {
    this.resolveExpr(expr.expression);
  }

  visitLiteralExpr(_: Literal) {
    // Noop – literals don't mention any variables nor do they contain any
    // subexpressions
  }

  visitLogicalExpr(expr: Logical) {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitUnaryExpr(expr: Unary) {
    this.resolveExpr(expr.right);
  }

  visitVariableExpr(expr: Variable) {
    if (
      !(this.scopes.length === 0) &&
      this.scopes.peek().get(expr.name.lexeme) === false
    ) {
      throw new ResolverError(
        expr.name,
        "Can't read local variable in its own initialiser."
      );
    }
    this.resolveLocal(expr, expr.name);
  }

  resolveStmts(statements: Stmt[]) {
    try {
      for (let statement of statements) {
        this.resolveStmt(statement);
      }
    } catch (err) {
      if (err instanceof ResolverError) {
        this.onError(err);
        return;
      }
      throw err;
    }
  }

  private resolveStmt(stmt: Stmt) {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr) {
    expr.accept(this);
  }

  private resolveFunction(func: Function, type: FunctionType) {
    const enclosingFunc = this.currentFunc;
    this.currentFunc = type;

    this.beginScope();
    for (let param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStmts(func.body);
    this.endScope();

    this.currentFunc = enclosingFunc;
  }

  private beginScope() {
    this.scopes.push(new Map<VariableName, Boolean>());
  }

  private endScope() {
    this.scopes.pop();
  }

  /**
   * Declaration adds the variable to the innermost scope so that it shadows any
   * outer one and so that we know the variable exists. We mark it as “not ready
   * yet” by binding its name to false in the scope map. The value associated
   * with a key in the scope map represents whether or not we have finished
   * resolving that variable’s initializer.
   */
  private declare(name: Token) {
    if (this.scopes.length === 0) return;

    const scope: Map<VariableName, Boolean> = this.scopes.peek();
    if (scope.has(name.lexeme)) {
      throw new ResolverError(
        name,
        "Already a variable with this name in this scope."
      );
    }
    scope.set(name.lexeme, false);
  }

  /**
   * Set the variable's value in the scope map to `true` to mark it as fully
   * initialised and available for use.
   */
  private define(name: Token) {
    if (this.scopes.length === 0) return;

    const scope: Map<VariableName, Boolean> = this.scopes.peek();
    scope.set(name.lexeme, true);
  }

  /**
   * Start at the innermost scope and work outwards, looking in each map for a
   * matching name. If found, resolve it, passing in the number of scopes
   * between the current innermost scope and the scope where the variable was
   * found. Unfound variables are left unresolved and are assumed to be global.
   */
  private resolveLocal(expr: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      let scope = this.scopes.get(i)!;
      if (scope.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
