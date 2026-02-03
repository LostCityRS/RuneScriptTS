import { AstVisitor } from '../../AstVisitor';
import { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';
import { VariableExpression } from './VariableExpression';

export class LocalVariableExpression extends VariableExpression {
  public readonly index?: Expression;

  constructor(
    source: NodeSourceLocation,
    name: Identifier,
    index?: Expression
  ) {
    super(source, name);
    this.index = index;

    if (index) {
      this.addChild(index);
    }
  }

  /**
    * Whether or not this variable expression references a local array variable.
    */
  get isArray(): boolean {
    return this.index != null;
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitLocalVariableExpression(this);
  }

}