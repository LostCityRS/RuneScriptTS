import { LocalVariableSymbol } from '#/compiler/symbol/Symbol.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';
import { Token } from '#/parser/ast/Token.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

/**
 * Represents a local array variable declaration with the given [typeToken] and [name]. The [initializer] is what determines
 * the array size.
 *
 * Example:
 * ```
 * def_int $ints(50);
 * ```
 */
export class ArrayDeclarationStatement extends Statement {
    public readonly kind = NodeKind.ArrayDeclarationStatement;
    public readonly typeToken: Token;
    public readonly name: Identifier;
    public readonly initializer: Expression;
    public symbol: LocalVariableSymbol;

    public constructor(source: NodeSourceLocation, typeToken: Token, name: Identifier, initializer: Expression) {
        super(source);
        this.typeToken = typeToken;
        this.name = name;
        this.initializer = initializer;

        this.addChild(this.typeToken);
        this.addChild(this.name);
        this.addChild(this.initializer);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitArrayDeclarationStatement(this);
    }
}
