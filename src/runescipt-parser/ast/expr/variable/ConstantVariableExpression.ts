import { JavaObjects } from '../../../runescript/util/JavaObjects';
import { AstVisitor } from '../../AstVisitor';
import { NodeSourceLocation } from '../../NodeSourceLocation';
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
  constructor(source: NodeSourceLocation, name: Identifier) {
    super(source, name);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitConstantVariableExpression(this);
  }

  hashCode(): number {
    return JavaObjects.hash(this.name);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof ConstantVariableExpression)) return false;

    return JavaObjects.equals(this.name, other.name);
  }
}