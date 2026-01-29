import { JavaObjects } from '../runescript/util/JavaObjects';
import { ToStringHelper } from '../runescript/util/ToStringHelper';
import { AstVisitor } from './AstVisitor';
import { Identifier } from './expr/Identifier';
import { Node } from './Node';
import { NodeSourceLocation } from './NodeSourceLocation';
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
  public readonly trigger: Identifier;
  public readonly name: Identifier;
  public readonly isStar: boolean;
  public readonly parameters?: Parameter[];
  public readonly returnTokens?: Token[];
  public readonly statements: Statement[];

  constructor(
    source: NodeSourceLocation,
    trigger: Identifier,
    name: Identifier,
    isStar: boolean,
    parameters: Parameter[] | undefined,
    returnTokens: Token[] | undefined,
    statements: Statement[]
  ) {
    super(source);
    this.trigger = trigger;
    this.name = name;
    this.isStar = isStar;
    this.parameters = parameters;
    this.returnTokens = returnTokens;
    this.statements = statements;

    // Kotlin init { ... }
    this.addChild(trigger);
    this.addChild(name);

    if (parameters) {
      this.addChildren(parameters);
    }

    if (returnTokens) {
      this.addChildren(returnTokens);
    }

    this.addChildren(statements);
  }

  /**
   * Script name, including '*' suffix when applicable.
   */
  get nameString(): string {
    return this.isStar ? `${this.name.text}*` : this.name.text;
  }

  accept<R>(visitor: AstVisitor<R>): R {
    return visitor.visitScript(this);
  }

  hashCode(): number {
    return JavaObjects.hash(
      this.trigger,
      this.name,
      this.isStar,
      this.parameters,
      this.returnTokens,
      this.statements
    );
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof Script)) return false;
    return (
      JavaObjects.equals(this.trigger, other.trigger) &&
      JavaObjects.equals(this.name, other.name) &&
      this.isStar === other.isStar &&
      JavaObjects.equals(this.parameters, other.parameters) &&
      JavaObjects.equals(this.returnTokens, other.returnTokens) &&
      JavaObjects.equals(this.statements, other.statements)
    );
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("trigger", this.trigger)
      .add("name", this.name)
      .add("isStar", this.isStar)
      .add("parameters", this.parameters)
      .add("returnTokens", this.returnTokens)
      .add("statements", this.statements)
      .toString();
  }
}