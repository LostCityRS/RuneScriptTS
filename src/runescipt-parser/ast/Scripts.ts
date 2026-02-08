
import { ScriptSymbol } from '../../runescript-compiler/symbol/ScriptSymbol';
import { BasicSymbol } from '../../runescript-compiler/symbol/Symbol';
import { SymbolTable } from '../../runescript-compiler/symbol/SymbolTable';
import { TriggerType } from '../../runescript-compiler/trigger/TriggerType';
import { Type } from '../../runescript-compiler/type/Type';
import { AstVisitor } from './AstVisitor';
import { Identifier } from './expr/Identifier';
import { Node } from './Node';
import { NodeKind } from './NodeKind';
import type { NodeSourceLocation } from './NodeSourceLocation';
import { Parameter } from './Parameter';
import { Statement } from './statement/Statement';
import { Token } from './Token';

/**
 * A script declaration containing the header and code of a script.
 *
 * Example:
 * ```
 * [proc,minmax](int $min, int $max, int $value)
 * if ($max <= $min) {
 *     $min, $max = $max, $min;
 * }
 *
 * $value = ~min($max, $value);
 * $value = ~max($min, $value);
 * return($value);
 * ```
 */
export class Script extends Node {
  public readonly kind = NodeKind.Script;
    public readonly trigger: Identifier;
    public readonly name: Identifier;
    public readonly isStar: boolean;
    public readonly parameters: Parameter[] | null;
    public readonly returnTokens: Token[] | null;
    public readonly statements: Statement[];
    public block: SymbolTable;
    public symbol: ScriptSymbol;
    public returnType: Type;
    public triggerType: TriggerType;
    public subjectReference: BasicSymbol | null = null;
    public parameterType: Type;

    public constructor(options: {
        source: NodeSourceLocation,
        trigger: Identifier,
        name: Identifier,
        isStar: boolean,
        parameters: Parameter[] | null,
        returnTokens: Token[] | null,
        statements: Statement[];
    }) {
        super(options.source);
        this.trigger = options.trigger;
        this.name = options.name;
        this.isStar = options.isStar;
        this.parameters = options.parameters;
        this.returnTokens = options.returnTokens;
        this.statements = options.statements;

        this.addChild(this.trigger);
        this.addChild(this.name);

        if (this.parameters) {
          this.addChildren(this.parameters);
        }

        if (this.returnTokens) {
          this.addChildren(this.returnTokens);
        }

        this.addChildren(this.statements);
    }

    /**
     * Script name, including '*' suffix when applicable.
     */
    public get nameString(): string {
      return this.isStar ? `${this.name.text}*` : this.name.text;
    }

    public accept<R>(visitor: AstVisitor<R>): R {
      return visitor.visitScript(this);
    }
}