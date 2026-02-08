import { AstVisitor } from '../../AstVisitor';
import { NodeKind } from '../../NodeKind';
import type { NodeSourceLocation } from '../../NodeSourceLocation';
import { Literal } from './Literal';

/**
 * An implementation of [Literal] for numeric literals.
 *
 * Example:
 * ```
 * 123456
 * ```
 */
export class IntegerLiteral extends Literal<number> {
    public readonly kind = NodeKind.IntegerLiteral;

    public constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIntegerLiteral(this);    
    }
}