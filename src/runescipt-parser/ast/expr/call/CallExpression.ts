import { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';
import { RuneScriptSymbol } from '../../../../runescript-compiler/symbol/Symbol';

/**
 * The base expression for all types of call expressions.
 */
export abstract class CallExpression extends Expression {
  public readonly name: Identifier;
  public readonly arguments: Expression[];

  public symbol: RuneScriptSymbol | null;

  constructor(source: NodeSourceLocation, name: Identifier, args: Expression[]) {
    super(source);
    this.name = name;
    this.arguments = args;

    this.addChild(name);
    this.addChildren(args);
  }
}