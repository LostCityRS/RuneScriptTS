import { SymbolTable } from '#/runescript-compiler/symbol/SymbolTable.js';
import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';

/**
 * Represents a block of statements.
 *
 * Example:
 * ```
 * {
 *    <code here>
 * }
 * ```
 */
export class BlockStatement extends Statement {
    public readonly kind = NodeKind.BlockStatement;
    public readonly statements: Statement[];
    public scope: SymbolTable;

    public constructor(source: NodeSourceLocation, statements: Statement[]) {
        super(source);
        this.statements = statements;
        this.addChildren(this.statements);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBlockStatement(this);
    }
}
