/**
 * AST
 * ~~~
 *
 * Abstract syntax trees for Expressions (Expr) and Statements (Stmt).
 *
 * DO NOT EDIT DIRECTLY
 * This file was generated using tool/generateAst.ts.
 *
 */

import Token from "../src/Token";

// MARK: Expr

export interface Expr {
  accept: <R>(visitor: ExprVisitor<R>) => R;
}

export interface ExprVisitor<R> {
  visitAssignExpr: (expr: Assign) => R;
  visitBinaryExpr: (expr: Binary) => R;
  visitCallExpr: (expr: Call) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitLogicalExpr: (expr: Logical) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitVariableExpr: (expr: Variable) => R;
}

export class Assign implements Expr {
  name: Token;
  value: Expr;

  constructor(name: Token, value: Expr) {
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Call implements Expr {
  callee: Expr;
  paren: Token;
  args: Expr[];

  constructor(callee: Expr, paren: Token, args: Expr[]) {
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitCallExpr(this);
  }
}

export class Grouping implements Expr {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expr {
  value: any;

  constructor(value: any) {
    this.value = value;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Logical implements Expr {
  left: Expr;
  operator: Token;
  right: Expr;

  constructor(left: Expr, operator: Token, right: Expr) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class Unary implements Expr {
  operator: Token;
  right: Expr;

  constructor(operator: Token, right: Expr) {
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable implements Expr {
  name: Token;

  constructor(name: Token) {
    this.name = name;
  }

  accept<R>(visitor: ExprVisitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}

// MARK: Stmt

export interface Stmt {
  accept: <R>(visitor: StmtVisitor<R>) => R;
}

export interface StmtVisitor<R> {
  visitBlockStmt: (stmt: Block) => R;
  visitExpressionStmt: (stmt: Expression) => R;
  visitFunctionStmt: (stmt: Function) => R;
  visitIfStmt: (stmt: If) => R;
  visitPrintStmt: (stmt: Print) => R;
  visitVarStmt: (stmt: Var) => R;
  visitWhileStmt: (stmt: While) => R;
}

export class Block implements Stmt {
  statements: Stmt[];

  constructor(statements: Stmt[]) {
    this.statements = statements;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}

export class Expression implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class Function implements Stmt {
  name: Token;
  params: Token[];
  body: Stmt[];

  constructor(name: Token, params: Token[], body: Stmt[]) {
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitFunctionStmt(this);
  }
}

export class If implements Stmt {
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt | null;

  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class Print implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Var implements Stmt {
  name: Token;
  initialiser: Expr | null;

  constructor(name: Token, initialiser: Expr | null) {
    this.name = name;
    this.initialiser = initialiser;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Stmt {
  condition: Expr;
  body: Stmt;

  constructor(condition: Expr, body: Stmt) {
    this.condition = condition;
    this.body = body;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}
