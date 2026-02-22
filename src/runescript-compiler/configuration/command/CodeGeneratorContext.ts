import { CallExpression } from '#/runescript-parser/ast/expr/call/CallExpression.js';
import { CommandCallExpression } from '#/runescript-parser/ast/expr/call/CommandCallExpression.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { Identifier } from '#/runescript-parser/ast/expr/Identifier.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { CodeGenerator } from '#/runescript-compiler/codegen/CodeGenerator.js';
import { Opcode } from '#/runescript-compiler/codegen/Opcode.js';
import { Diagnostics } from '#/runescript-compiler/diagnostics/Diagnostics.js';
import { ScriptSymbol } from '#/runescript-compiler/symbol/ScriptSymbol.js';
import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';
import { Node } from '#/runescript-parser/ast/Node.js';

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
        if (this.expression instanceof CommandCallExpression && this.expression.isStar && this.expression.arguments2) {
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
        const symbol: ScriptSymbol | null = (() => {
            if (this.expression instanceof CommandCallExpression) {
                return this.expression.symbol as ScriptSymbol | null;
            }
            if (this.expression instanceof Identifier) {
                return this.expression.reference as ScriptSymbol | null;
            }
            return null;
        })();

        this.lineInstruction(this.expression);
        if (!symbol) {
            throw new Error('Symbol cannot be null for command generation.');
        }
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
