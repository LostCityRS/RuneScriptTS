import { AstVisitor } from '../../AstVisitor';
import { NodeKind } from '../../NodeKind';
import type { NodeSourceLocation } from '../../NodeSourceLocation';
import { Expression } from '../Expression';
import { Identifier } from '../Identifier';
import { VariableExpression } from './VariableExpression';

export class LocalVariableExpression extends VariableExpression {
    public readonly kind = NodeKind.LocalVariableExpression;
    public readonly index: Expression | null;

    public constructor(source: NodeSourceLocation, name: Identifier, index: Expression | null) {
        super(source, name);
        this.index = index;
        this.addChild(this.index);
    }

    /**
      * Whether or not this variable expression references a local array variable.
      */
    public get isArray(): boolean {
        return this.index != null;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitLocalVariableExpression(this);
    }
}