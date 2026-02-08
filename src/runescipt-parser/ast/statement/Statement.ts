import { Node } from '../Node';
import type { NodeSourceLocation } from '../NodeSourceLocation';

/**
 * The base statement node that all statements extend.
 */
export abstract class Statement extends Node {
    protected constructor(source: NodeSourceLocation) {
        super(source);
    }
}