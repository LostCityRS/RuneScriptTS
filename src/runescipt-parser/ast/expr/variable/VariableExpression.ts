import { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';

/**
 * A base representation of a variable being used as an [Expression].
 */
// base class for a variable reference, all have an identifier
export abstract class VariableExpression extends Expression {
  public readonly name: Identifier;

  protected constructor(source: NodeSourceLocation, name: Identifier) {
    super(source);
    this.name = name;

    this.addChild(name);
  }
}