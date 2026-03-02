import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { Node } from '#/parser/ast/Node.js';

import { BinaryExpression } from '#/parser/ast/expr/BinaryExpression.js';
import { CalcExpression } from '#/parser/ast/expr/CalcExpression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';
import { JoinedStringExpression } from '#/parser/ast/expr/JoinedStringExpression.js';
import { BasicStringPart, ExpressionStringPart, StringPart } from '#/parser/ast/expr/StringPart.js';

import { CommandCallExpression } from '#/parser/ast/expr/call/CommandCallExpression.js';

import { CharacterLiteral } from '#/parser/ast/expr/literal/CharacterLiteral.js';
import { Literal } from '#/parser/ast/expr/literal/Literal.js';
import { NullLiteral } from '#/parser/ast/expr/literal/NullLiteral.js';
import { StringLiteral } from '#/parser/ast/expr/literal/StringLiteral.js';

import { ConstantVariableExpression } from '#/parser/ast/expr/variable/ConstantVariableExpression.js';
import { GameVariableExpression } from '#/parser/ast/expr/variable/GameVariableExpression.js';
import { LocalVariableExpression } from '#/parser/ast/expr/variable/LocalVariableExpression.js';

export class ExpressionGenerator extends AstVisitor<string> {
    override visitBinaryExpression(expr: BinaryExpression): string {
        return `${this.visit(expr.left)} ${expr.operator.text} ${this.visit(expr.right)}`;
    }

    override visitCalcExpression(expr: CalcExpression): string {
        return `calc${this.visit(expr.expression)}`;
    }

    override visitCommandCallExpression(expr: CommandCallExpression): string {
        let result = '~' + this.visit(expr.name);

        if (expr.arguments.length > 0) {
            result += '(';
            result += expr.arguments.map(arg => this.visit(arg)).join('');
            result += ')';
        }

        return result;
    }

    override visitLocalVariableExpression(expr: LocalVariableExpression): string {
        return `$${this.visit(expr.name)}`;
    }

    override visitGameVariableExpression(expr: GameVariableExpression): string {
        return `%${this.visit(expr.name)}`;
    }

    override visitConstantVariableExpression(expr: ConstantVariableExpression): string {
        return `^${this.visit(expr.name)}`;
    }

    override visitCharacterLiteral(literal: CharacterLiteral): string {
        return `'${literal.value}'`;
    }

    override visitNullLiteral(_: NullLiteral): string {
        return 'null';
    }

    override visitStringLiteral(literal: StringLiteral): string {
        return `"${literal.value}"`;
    }

    override visitLiteral(literal: Literal<unknown>): string {
        return String(literal.value);
    }

    override visitJoinedStringExpression(expr: JoinedStringExpression): string {
        let result = '"';

        for (const part of expr.parts) {
            result += this.visit(part);
        }

        result += '"';
        return result;
    }

    override visitJoinedStringPart(part: StringPart): string {
        if (part instanceof BasicStringPart) {
            return part.value;
        }

        if (part instanceof ExpressionStringPart) {
            return `<${this.visit(part.expression)}>`;
        }

        throw new Error(`Unsupported StringPart: ${part}`);
    }

    override visitIdentifier(identifier: Identifier): string {
        return identifier.text;
    }

    /**
     * Calls [Node.accept] on all nodes in a list.
     */
    private visit(node: Node) {
        node.accept(this);
    }
}
