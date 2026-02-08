import { LocalVariableSymbol } from '../../../runescript-compiler/symbol/Symbol';
import { AstVisitor } from '../AstVisitor';
import { Expression } from '../expr/Expression';
import { Identifier } from '../expr/Identifier';
import { NodeKind } from '../NodeKind';
import type { NodeSourceLocation } from '../NodeSourceLocation';
import { Token } from '../Token';
import { Statement } from './Statement';

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