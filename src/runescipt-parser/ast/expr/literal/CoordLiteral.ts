import { AstVisitor } from '../../AstVisitor';
import { NodeSourceLocation } from '../../NodeSourceLocation';
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
    constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCoordLiteral(this);
    }
}