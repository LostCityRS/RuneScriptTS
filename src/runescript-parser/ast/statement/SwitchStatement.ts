import { Type } from '#/runescript-compiler/type/Type.js';
import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Expression } from '#/runescript-parser/ast/expr/Expression.js';
import { NodeKind } from '#/runescript-parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Token } from '#/runescript-parser/ast/Token.js';
import { Statement } from '#/runescript-parser/ast/statement/Statement.js';
import { SwitchCase } from '#/runescript-parser/ast/statement/SwitchCase.js';

/**
 * Represents a switch statement for a given [typeToken]. Switch statements contain a single [condition] (what to switch on)
 * and a list of [cases].
 *
 * Example:
 * ```
 * switch_int ($var) {
 *     case 1 : mes("matched 1");
 *     case 2 : mes("matched 2");
 *     case default : mes("unmatched: <tostring($var)>");
 * }
 * ```
 */
export class SwitchStatement extends Statement {
    public readonly kind = NodeKind.SwitchStatement;
    public readonly typeToken: Token;
    public readonly condition: Expression;
    public readonly cases: SwitchCase[];
    public defaultCase: SwitchCase | null = null;
    public type: Type;

    public constructor(source: NodeSourceLocation, typeToken: Token, condition: Expression, cases: SwitchCase[]) {
        super(source);
        this.typeToken = typeToken;
        this.condition = condition;
        this.cases = cases;

        this.addChild(this.typeToken);
        this.addChild(this.condition);
        this.addChildren(this.cases);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitSwitchStatement(this);
    }
}
