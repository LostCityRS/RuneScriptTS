import { SymbolTable } from '../../../runescript-compiler/symbol/SymbolTable';
import { AstVisitor } from '../AstVisitor';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

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