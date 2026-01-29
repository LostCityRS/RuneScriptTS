import { Hashable } from '../../../runescript/util/Hashable';
import { JavaObjects } from '../../../runescript/util/JavaObjects';
import { ToStringHelper } from '../../../runescript/util/ToStringHelper';
import { AstVisitor } from '../../AstVisitor';
import { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';

/**
 * The base expression for all types of call expressions.
 */
export abstract class CallExpression extends Expression {
  public readonly name: Identifier;
  public readonly arguments: Expression[];

  constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
    super(source);
    this.name = name;
    this.arguments = args;

    this.addChild(name);
    this.addChildren(args);
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("name", this.name)
      .add("arguments", this.arguments)
      .toString();
  }
}