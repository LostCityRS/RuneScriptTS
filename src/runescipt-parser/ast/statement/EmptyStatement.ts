import { AstVisitor } from '../AstVisitor';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Statement } from './Statement';

/**
 * Represents a statement with no code attached.
 *
 * Example:
 * ```
 * ;
 * ```
 */
export class EmptyStatement extends Statement {
    public readonly = NodeKind.EmptyStatement;

    public constructor(source: NodeSourceLocation) {
        super(source);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitEmptyStatement(this);
    }
}