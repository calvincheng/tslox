/*
 * The following grammars are implemented:
 * --------------------------------------------------------------
 * (Expr)
 * expression     → assignment ;
 * assignment     → IDENTIFIER "=" assignment
 *                | equality ;
 * equality       → comparison ( ( "!=" | "==" ) comparison )* ;
 * comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
 * term           → factor ( ( "-" | "+" ) factor )* ;
 * factor         → unary ( ( "/" | "*" ) unary )* ;
 * unary          → ( "!" | "-" ) unary
 *                | primary ;
 * primary        → "true" | "false" | "nil"
 *                | NUMBER | STRING
 *                | "(" expression ")"
 *                | IDENTIFIER ;
 * ---------------------------------------------------------------
 * (Stmt)
 * program        → declaration* EOF ;
 *
 * declaration    → varDecl
 *                | statement ;
 *
 * statement      → exprStmt
 *                | printStmt ;
 *
 * varDecl        → "var" IDENTIFIER ( "=" expression)? ";" ;
 *
 * exprStmt       → expression ";" ;
 * printStmt      → "print" expression ";" ;
 * ---------------------------------------------------------------
 */

import fs from "fs";

type Field = {
  type: string;
  name: string;
};

const lines: string[] = [];

/**
 * Helper function that appends lines to the file
 */
function writeLine(line = "") {
  lines.push(line);
}

/**
 * Helper function that writes the AST implementation to file
 */
function defineAst(baseName: string, types: { [type: string]: Field[] }) {
  writeLine(`// MARK: ${baseName}`);
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
  writeLine(`  accept: <R>(visitor: ${baseName}Visitor<R>) => R;`);
  writeLine(`}`);
}

/**
 * Helper function that writes the visitor interface to file
 */
function defineVisitor(baseName: string, types: { [type: string]: Field[] }) {
  writeLine(`export interface ${baseName}Visitor<R> {`);
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
  writeLine(`  accept<R>(visitor: ${baseName}Visitor<R>): R {`);
  writeLine(`    return visitor.visit${className}${baseName}(this);`);
  writeLine(`  }`);

  // End class definition
  writeLine("}");
}

/**
 * Driver method
 */
function main() {
  const outputDir = "src";
  const path = `${outputDir}/Ast.ts`;

  // Header docstring
  [
    `/**`,
    ` * AST`,
    ` * ~~~`,
    ` *`,
    ` * Abstract syntax trees for Expressions (Expr) and Statements (Stmt).`,
    ` *`,
    ` * DO NOT EDIT DIRECTLY`,
    ` * This file was generated using tool/generateAst.ts.`,
    ` *`,
    ` */`,
  ].forEach((line) => writeLine(line));
  writeLine();

  // Imports
  writeLine(`import Token from "../src/Token";`);
  writeLine();

  // AST definitions
  defineAst("Expr", {
    Assign: [
      { name: "name", type: "Token" },
      { name: "value", type: "Expr" },
    ],
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
    Variable: [{ name: "name", type: "Token" }],
  });
  defineAst("Stmt", {
    Expression: [{ name: "expression", type: "Expr" }],
    Print: [{ name: "expression", type: "Expr" }],
    Var: [
      { name: "name", type: "Token" },
      { name: "initialiser", type: "Expr | null" },
    ],
  });

  // Write to filepath
  fs.writeFileSync(path, lines.join("\n"), { encoding: "utf8", flag: "w" });
}

main();
