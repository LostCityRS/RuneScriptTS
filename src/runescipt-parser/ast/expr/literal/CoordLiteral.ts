import { AstVisitor } from '../../AstVisitor';
import { NodeKind } from '../../NodeKind';
import type { NodeSourceLocation } from '../../NodeSourceLocation';
import { Literal } from './Literal';

/**
 * An implementation of [Literal] for coord literals.
 *
 * Example:
 * ```
 * 0_50_50_0_0
 * ```
 */
export class CoordLiteral extends Literal<number> {
    public readonly kind = NodeKind.CoordLiteral;
    
    public constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCoordLiteral(this);
    }
}