import { Node } from '#/runescript-parser/ast/Node.js';
import type { NodeSourceLocation } from '#/runescript-parser/ast/NodeSourceLocation.js';

/**
 * The base statement node that all statements extend.
 */
export abstract class Statement extends Node {
    protected constructor(source: NodeSourceLocation) {
        super(source);
    }
}
