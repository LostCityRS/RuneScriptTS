import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';

/**
 * Represents a piece of a [JoinedStringExpression]
 */
export abstract class StringPart extends Node {
    protected constructor(source: NodeSourceLocation) {
        super(source);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitJoinedStringPart(this);
    }
}

/**
 * A basic part that contains only text.
 */
export class BasicStringPart extends StringPart {
    public readonly kind: NodeKind = NodeKind.BasicStringPart;
    public readonly value: string;

    public constructor(source: NodeSourceLocation, value: string) {
        super(source);
        this.value = value;
    }
}

/**
 * A basic part that contains a `<p,name>` tag.
 */
export class PTagStringPart extends BasicStringPart {
    public readonly kind = NodeKind.PTagStringPart;
}

/**
 * A part that contains an [Expression] that will be executed.
 */
export class ExpressionStringPart extends StringPart {
    public readonly kind = NodeKind.ExpressionStringPart;
    public readonly expression: Expression;

    public constructor(source: NodeSourceLocation, expression: Expression) {
        super(source);
        this.expression = expression;

        this.addChild(this.expression);
    }
}
