import { Expr, Visitor, Binary, Grouping, Literal, Unary } from "./Ast";
import Token from "./Token";
import { TokenType } from "./TokenType";

class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    return expr.value === null ? "nil" : String(expr.value);
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name}${exprs.map((expr) => ` ${expr.accept(this)}`).join("")})`;
  }
}

/**
 * Chapter 5, Challenge 3
 *
 * Define a visitor class for our syntax tree classes that takes an expression,
 * converts it to RPN, and returns the resulting string.
 *
 * For example,
 * (1 + 2) * (4 - 3) becomes 1 2 + 4 3 - *
 */
class AstRpnPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitUnaryExpr(expr: Unary): string {
    return this.rpnize(expr.operator.lexeme, expr.right);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.rpnize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.rpnize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    return expr.value === null ? "nil" : String(expr.value);
  }

  rpnize(name: string, ...exprs: Expr[]): string {
    return `${exprs.map((expr) => `${expr.accept(this)}`).join(" ")} ${name}`;
  }
}

/*
 * Uncomment below to test AstPrinter/AstRpnPrinter.
 * You can test it by running this file directly (e.g. using ts-node)
 */

// function main(): void {
//   const printer = new AstRpnPrinter();
//   const expression = new Binary(
//     new Binary(
//       new Literal(1),
//       new Token(TokenType.PLUS, "+", null, 1),
//       new Literal(2)
//     ),
//     new Token(TokenType.STAR, "*", null, 1),
//     new Binary(
//       new Literal(4),
//       new Token(TokenType.MINUS, "-", null, 1),
//       new Literal(3)
//     )
//   );
//   console.log(printer.print(expression));
// }
//
// main();
