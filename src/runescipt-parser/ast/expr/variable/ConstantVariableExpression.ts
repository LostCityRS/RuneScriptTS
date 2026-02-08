import { AstVisitor } from '../../AstVisitor';
import { NodeKind } from '../../NodeKind';
import type { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';
import { VariableExpression } from './VariableExpression';

/**
 * A [VariableExpression] implementation that represents a constant variable reference.
 *
 * Example:
 * ```
 * ^var
 * ```
 */
export class ConstantVariableExpression extends VariableExpression {
    public readonly kind = NodeKind.ConstantVariableExpression;
    public subExpression: Expression | null = null;

    public constructor(source: NodeSourceLocation, name: Identifier) {
        super(source, name);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
      return visitor.visitConstantVariableExpression(this);
    }
}