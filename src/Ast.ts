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
  visitBinaryExpr: (expr: Binary) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitUnaryExpr: (expr: Unary) => R;
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

// MARK: Stmt

export interface Stmt {
  accept: <R>(visitor: StmtVisitor<R>) => R;
}

export interface StmtVisitor<R> {
  visitExpressionStmt: (stmt: Expression) => R;
  visitPrintStmt: (stmt: Print) => R;
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

export class Print implements Stmt {
  expression: Expr;

  constructor(expression: Expr) {
    this.expression = expression;
  }

  accept<R>(visitor: StmtVisitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}
