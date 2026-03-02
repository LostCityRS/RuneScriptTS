import { SymbolTable } from '#/compiler/symbol/SymbolTable.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

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

    public constructor(source: NodeSourceLocation, statements: Statement[]) {
        super(source);
        this.statements = statements;
        this.addChildren(this.statements);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitBlockStatement(this);
    }
}
