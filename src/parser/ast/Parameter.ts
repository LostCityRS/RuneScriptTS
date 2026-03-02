import { LocalVariableSymbol } from '#/compiler/symbol/Symbol.js';

import { AstVisitor } from '#/parser/ast/AstVisitor.js';
import { Node } from '#/parser/ast/Node.js';
import type { NodeSourceLocation } from '#/parser/ast/NodeSourceLocation.js';
import { Token } from '#/parser/ast/Token.js';

import { Identifier } from '#/parser/ast/expr/Identifier.js';

/**
 * Represent a single parameter in a [Script].
 *
 * Example:
 * ```
 * int $some_name
 * ```
 */
export class Parameter extends Node {
    public readonly typeToken: Token;
    public readonly name: Identifier;
    public symbol: LocalVariableSymbol;

    constructor(source: NodeSourceLocation, typeToken: Token, name: Identifier) {
        super(source);
        this.typeToken = typeToken;
        this.name = name;

        this.addChild(this.typeToken);
        this.addChild(this.name);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitParameter(this);
    }
}
