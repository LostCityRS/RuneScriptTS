import { AstVisitor } from '#/runescript-parser/ast/AstVisitor.js';
import { Node } from '#/runescript-parser/ast/Node.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';
import { Script } from '#/runescript-parser/ast/Scripts.js';

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

        this.addChildren(this.scripts);
    }

    accept<R>(visitor: AstVisitor<R>): R {
        return visitor.visitScriptFile(this);
    }
}
