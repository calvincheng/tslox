/*
 * The following grammar is implemented:
 * --------------------------------------------------------------
 * expression     → literal
 *                | unary
 *                | binary
 *                | grouping ;
 *
 * literal        → NUMBER | STRING | "true" | "false" | "nil" ;
 * grouping       → "(" expression ")" ;
 * unary          → ( "-" | "!" ) expression ;
 * binary         → expression operator expression ;
 * operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
 *                | "+"  | "-"  | "*" | "/" ;
 * ---------------------------------------------------------------
 */

import fs from "fs";

type Field = {
  type: string;
  name: string;
};

function run(outputDir: string) {
  const baseName = "Expr";
  const path = `${outputDir}/Ast.ts`;
  const lines: string[] = [];

  /**
   * Helper function that appends lines to the file
   */
  function writeLine(line = "") {
    lines.push(line);
  }

  function defineAst(baseName: string, types: { [type: string]: Field[] }) {
    [
      `/**`,
      ` * AST`,
      ` * ~~~`,
      ` *`,
      ` * DO NOT EDIT DIRECTLY`,
      ` * This file was generated using tool/generateAst.ts.`,
      ` *`,
      ` */`,
    ].forEach((line) => writeLine(line));
    writeLine();

    writeLine(`import Token from "../src/Token";`);
    writeLine();

    defineBase(baseName);
    writeLine();

    defineVisitor(baseName, types);
    writeLine();

    for (let [className, fields] of Object.entries(types)) {
      defineType(baseName, className, fields);
      writeLine();
    }
  }

  /**
   * Helper function that writes the base interface to file
   */
  function defineBase(baseName: string) {
    writeLine(`export interface ${baseName} {`);
    writeLine(`  accept: <R>(visitor: Visitor<R>) => R;`);
    writeLine(`}`);
  }

  /**
   * Helper function that writes the visitor interface to file
   */
  function defineVisitor(baseName: string, types: { [type: string]: Field[] }) {
    writeLine(`export interface Visitor<R> {`);
    for (let [className] of Object.entries(types)) {
      writeLine(
        `  visit${className}${baseName}: (${baseName.toLowerCase()}: ${className}) => R;`
      );
    }
    writeLine(`}`);
  }

  /**
   * Helper function that writes a type interface to file
   */
  function defineType(baseName: string, className: string, fields: Field[]) {
    // Begin class definition
    writeLine(`export class ${className} implements ${baseName} {`);

    // Fields
    for (let { type, name } of fields) {
      writeLine(`  ${name}: ${type};`);
    }
    writeLine();

    // Constructor
    const constructorArgs = fields
      .map(({ type, name }) => `${name}: ${type}`)
      .join(", ");

    writeLine(`  constructor(${constructorArgs}) {`);
    // Store paramters in fields
    for (let field of fields) {
      const { name } = field;
      writeLine(`    this.${name} = ${name};`);
    }
    writeLine("  }");

    writeLine();
    writeLine(`  accept<R>(visitor: Visitor<R>): R {`);
    writeLine(`    return visitor.visit${className}${baseName}(this);`);
    writeLine(`  }`);

    // End class definition
    writeLine("}");
  }

  defineAst(baseName, {
    Binary: [
      { name: "left", type: "Expr" },
      { name: "operator", type: "Token" },
      { name: "right", type: "Expr" },
    ],
    Grouping: [{ name: "expression", type: "Expr" }],
    Literal: [{ name: "value", type: "any" }],
    Unary: [
      { name: "operator", type: "Token" },
      { name: "right", type: "Expr" },
    ],
  });

  fs.writeFileSync(path, lines.join("\n"), { encoding: "utf8", flag: "w" });
}

run("src");
