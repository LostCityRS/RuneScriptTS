import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

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
