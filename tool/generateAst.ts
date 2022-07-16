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

import fs from "fs/promises";

type Field = {
  type: string;
  name: string;
};

function run(outputDir: string) {
  const baseName = "Expr";
  const path = `${outputDir}/Ast.ts`;

  /**
   * Helper function that appends lines to the file
   */
  async function writeLine(text = "") {
    try {
      await fs.appendFile(path, text + "\n");
    } catch (err) {
      console.error(err);
    }
  }

  async function defineAst(
    baseName: string,
    types: { [type: string]: Field[] }
  ): Promise<void> {
    await writeLine(`import Token from "../src/Token";`);
    await writeLine();

    await defineBase(baseName);
    await writeLine();

    for (let [className, fields] of Object.entries(types)) {
      await defineType(baseName, className, fields);
      await writeLine();
    }
  }

  /**
   * Helper function that writes the base interface to file
   */
  async function defineBase(baseName: string) {
    await writeLine(`export interface ${baseName} {}`);
  }

  /**
   * Helper function that writes a type interface to file
   */
  async function defineType(
    baseName: string,
    className: string,
    fields: Field[]
  ): Promise<void> {
    // Begin class definition
    await writeLine(`export class ${className} implements ${baseName} {`);

    // Fields
    for (let { type, name } of fields) {
      await writeLine(`  ${name}: ${type};`);
    }
    await writeLine();

    // Constructor
    const constructorArgs = fields
      .map(({ type, name }) => `${name}: ${type}`)
      .join(", ");

    await writeLine(`  constructor(${constructorArgs}) {`);
    // Store paramters in fields
    for (let field of fields) {
      const { name } = field;
      await writeLine(`    this.${name} = ${name};`);
    }
    await writeLine("  }");

    // End class definition
    await writeLine("}");
  }

  defineAst(baseName, {
    Binary: [
      { name: "left", type: "Expr" },
      { name: "operator", type: "Token" },
      { name: "right", type: "Expr" },
    ],
    Grouping: [{ name: "expression", type: "Expr" }],
    Literal: [{ name: "value", type: "Object" }],
    Unary: [
      { name: "operator", type: "Token" },
      { name: "right", type: "Expr" },
    ],
  });
}

run("src");
