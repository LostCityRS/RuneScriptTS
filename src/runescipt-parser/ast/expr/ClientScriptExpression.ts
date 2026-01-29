import { Hashable } from '../../../util/Hashable';
import { JavaObjects } from '../../../util/JavaObjects';
import { ToStringHelper } from '../../../util/ToStringHelper';
import { AstVisitor } from '../AstVisitor';
import { NodeSourceLocation } from '../NodeSourceLocation';
import { CallExpression } from './call/CallExpression';
import { Expression } from './Expression';
import { Identifier } from './Identifier';

/**
 * A parsed ClientScript reference.
 *
 * Example:
 * ```
 * some_handler(){var1}
 * ```
 */
export class ClientScriptExpression extends CallExpression implements Hashable {
  public readonly transmitList: Expression[];

  constructor(
    source: NodeSourceLocation,
    name: Identifier,
    argumentsList: Expression[],
    transmitList: Expression[]
  ) {
    super(source, name, argumentsList);
    this.transmitList = transmitList;

    this.addChildren(transmitList);
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitClientScriptExpression(this);
  }

  hashCode(): number {
    return JavaObjects.hash(this.name, this.arguments, this.transmitList);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof ClientScriptExpression)) return false;
    return (
      JavaObjects.equals(this.name, other.name) &&
      JavaObjects.equals(this.arguments, other.arguments) &&
      JavaObjects.equals(this.transmitList, other.transmitList)
    );
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("name", this.name)
      .add("arguments", this.arguments)
      .add("triggers", this.transmitList)
      .toString();
  }
}
