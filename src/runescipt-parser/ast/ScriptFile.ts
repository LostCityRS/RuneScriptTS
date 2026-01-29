
import { JavaObjects } from '../../util/JavaObjects';
import { ToStringHelper } from '../../util/ToStringHelper';
import { AstVisitor } from './AstVisitor';
import { Node } from './Node';
import { NodeSourceLocation } from './NodeSourceLocation';
import { Script } from './Scripts';

/**
 * The top level node type that represents a full file of [scripts].
 *
 * See [Script] for an example of what a script is.
 */
export class ScriptFile extends Node {
    public readonly scripts: Script[];

    constructor(source: NodeSourceLocation, scripts: Script[]) {
        super(source);
        this.scripts = scripts;

        this.addChildren(scripts);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitScriptFile(this);
    }

    hashCode(): number {
        return JavaObjects.hash(this.scripts);
    }

    equals(other: unknown): boolean {
        if (this === other) return true;
        if (!(other instanceof ScriptFile)) return false;
        return JavaObjects.equals(this.scripts, other.scripts);
    }

    toString(): string {
        return new ToStringHelper(this)
            .add("scripts", this.scripts)
            .toString();
    }
}