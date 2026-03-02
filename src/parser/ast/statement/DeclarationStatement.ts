import { LocalVariableSymbol } from '#/compiler/symbol/Symbol.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { NodeKind } from '#/parser/ast/NodeKind.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';
import { Token } from '#/parser/ast/Token.js';

import { Expression } from '#/parser/ast/expr/Expression.js';
import { Identifier } from '#/parser/ast/expr/Identifier.js';

import { Statement } from '#/parser/ast/statement/Statement.js';

/**
 * Represents a local variable declaration statement that defines the variables [typeToken], [name], and an optional
 * [initializer].
 *
 * Example:
 * ```
 * def_int $var1 = 0;
 * ```
 */
export class DeclarationStatement extends Statement {
    public readonly kind = NodeKind.DeclarationStatement;
    public readonly typeToken: Token;
    public readonly name: Identifier;
    public readonly initializer: Expression | null;
    public symbol: LocalVariableSymbol;

    public constructor(source: NodeSourceLocation, typeToken: Token, name: Identifier, initializer: Expression | null) {
        super(source);
        this.typeToken = typeToken;
        this.name = name;
        this.initializer = initializer;

        this.addChild(this.typeToken);
        this.addChild(this.name);
        this.addChild(this.initializer);
    }

    public accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitDeclarationStatement(this);
    }
}
