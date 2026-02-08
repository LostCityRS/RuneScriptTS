import { CallExpression } from '../../../runescipt-parser/ast/expr/call/CallExpression';
import { CommandCallExpression } from '../../../runescipt-parser/ast/expr/call/CommandCallExpression';
import { Expression } from '../../../runescipt-parser/ast/expr/Expression';
import { Identifier } from '../../../runescipt-parser/ast/expr/Identifier';
import type { NodeSourceLocation } from '../../../runescipt-parser/ast/NodeSourceLocation';
import { CodeGenerator } from '../../codegen/CodeGenerator';
import { Opcode } from '../../codegen/Opcode';
import { Diagnostics } from '../../diagnostics/Diagnostics';
import { ScriptSymbol } from '../../symbol/ScriptSymbol';
import { SymbolTable } from '../../symbol/SymbolTable';
import { Node } from '../../../runescipt-parser/ast/Node';

/**
 * Contains the context of the [CodeGenerator] and supplies useful functions when
 * implementing a dynamic command handler.
 */
export class CodeGeneratorContext {
    constructor(
        private codeGenerator: CodeGenerator,
        public rootTable: SymbolTable,
        public expression: Expression,
        public diagnostics: Diagnostics
    ) {}

    /**
     * Returns a list of expressions that were passed to the expression as arguments.
     *
     * This returns [CallExpression.arguments] if the expression is a [CallExpression],
     * otherwise an empty list.
     */
    get arguments(): Expression[] {
        if (this.expression instanceof CallExpression) return this.expression.arguments;
        return [];
    }

    /**
     * Returns a list of expressions that were passed to the expression as arguments.
     *
     * This returns [CommandCallExpression.arguments2] if the expression is a [CommandCallExpression],
     * otherwise an empty list.
     */
    get arguments2(): Expression[] {
        if (
            this.expression instanceof CommandCallExpression &&
            this.expression.isStar &&
            this.expression.arguments2
        ) {
            return this.expression.arguments2;
        }
        return [];
    }

    /**
     * Emits a new instruction with the given [opcode] and [operand].
     */
    instruction<T>(opcode: Opcode<T>, operand: T, source?: NodeSourceLocation): void {
        this.codeGenerator.instruction(opcode, operand, source);
    }

    /**
     * Emits the line number instruction and the command call instruction. This
     * should be preferred over manually writing the command instruction when
     * possible.
     *
     * This is a shortcut to the following:
     * ```
     * expression.lineInstruction()
     * instruction(Opcode.COMMAND, expression.symbol)
     * ```
     */
    command(): void {
        /**
         * The symbol is verified to not be null in CodeGenerator before calling user
         * code generation code which makes this safe, but we'll make the compiler happy. 
         */
        const symbol = (() => {
        if (this.expression instanceof CommandCallExpression) this.expression.symbol;
        if (this.expression instanceof Identifier) return this.expression.reference;
        })() as ScriptSymbol | null;

        this.lineInstruction(this.expression);
        if (!symbol) throw new Error("Symbol cannot be null for command generation");
        this.instruction(Opcode.Command, symbol, this.expression.source);
    }

    /**
     * Inserts the line number meta instruction for the node.
     */
    lineInstruction(node: Node): void {
        this.codeGenerator.lineInstruction(node);
    }

    /**
     * Passes the node through the code generator if it is not `null`.
     */
    visitNode(node: Node | null | undefined): void {
        if (!node) return;
        this.codeGenerator.visitNodeOrNull(node);
    }

    /**
     * Passes the expression through the code generator if it is not `null`.
     */
    visitExpression(expr: Expression | null | undefined): void {
        if (!expr) return;
        this.codeGenerator.visitNodeOrNull(expr);
    }

    /**
     * Passes all nodes within the list through the code generator if it is not `null`.
     */
    visitNodes(nodes: Node[] | null | undefined): void {
        if (!nodes) return;
        this.codeGenerator.visitNodes(nodes);
    }
}