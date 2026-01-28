import { Node } from '../Node';
import { NodeSourceLocation } from '../NodeSourceLocation';

/** 
 * The base expression node that all expressions extend.
 */
export abstract class Expression extends Node {
    constructor(source: NodeSourceLocation) {
        super(source);
    }
}