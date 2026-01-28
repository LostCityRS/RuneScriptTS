import { Node } from '../Node';
import { NodeSourceLocation } from '../NodeSourceLocation';

/**
 * The base statement node that all statements extend.
 */

export abstract class Statement extends Node {
  constructor(source: NodeSourceLocation) {
    super(source);
  }
}