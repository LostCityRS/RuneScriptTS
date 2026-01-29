import { AstVisitor } from '../../AstVisitor';
import { NodeSourceLocation } from '../../NodeSourceLocation';
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
    constructor(source: NodeSourceLocation, value: number) {
        super(source, value);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitIntegerLiteral(this);    
    }
}