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

function main(): void {
  const expression = new Binary(
    new Binary(
      new Literal(1),
      new Token(TokenType.PLUS, "+", null, 1),
      new Literal(4)
    ),
    new Token(TokenType.EQUAL_EQUAL, "==", null, 1),
    new Literal(5)
  );
  console.log(new AstPrinter().print(expression));
}

main();
