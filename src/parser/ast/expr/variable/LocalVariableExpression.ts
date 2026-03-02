import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { VariableExpression } from '#/parser/ast/expr/variable/VariableExpression.js';

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
