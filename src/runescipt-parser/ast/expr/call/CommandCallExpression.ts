import { AstVisitor } from '../../AstVisitor';
import { NodeKind } from '../../NodeKind';
import type { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';
import { CallExpression } from './CallExpression';

/**
 * A CallExpression for command calls.
 */
export class CommandCallExpression extends CallExpression {
    public readonly kind = NodeKind.CommandCallExpression;
    public readonly arguments2: Expression[] | null;

    public constructor(
      source: NodeSourceLocation,
      name: Identifier,
      args: Expression[],
      args2: Expression[] | null
    ) {
      super(source, name, args);
      this.arguments2 = args2;

      if (this.arguments2) {
          this.addChildren(this.arguments2);
      }
    }

    public get isStar(): boolean {
        return this.arguments2 != null;
    }

    public get nameString(): string {
        return this.isStar ? `${this.name.text}*` : this.name.text;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitCommandCallExpression(this);
    }
}