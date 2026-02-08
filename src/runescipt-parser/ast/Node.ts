import { Diagnostic } from '../../runescript-compiler/diagnostics/Diagnostic';
import { Diagnostics } from '../../runescript-compiler/diagnostics/Diagnostics';
import { DiagnosticType } from '../../runescript-compiler/diagnostics/DiagnosticType';
import { AstVisitor } from './AstVisitor';
import type { NodeSourceLocation } from './NodeSourceLocation';

/**
 * The base [abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) node.
 */
export abstract class Node {
  /**
   * The nodes parent node if it belongs to one.
   */
  public parent: Node | null = null;

  /**
   * A [MutableList] of children for our use only.
   */
  private readonly _children: Node[] = [];

  /**
   * All nodes that belong (directly) to this node.
   */
  public get children(): readonly Node[] {
    return this._children;
  }

  /**
   * A map of attributes that allows external code to add extra information to the node.
   */
  private readonly attributes = new Map<string, unknown>();

  protected constructor(public readonly source: NodeSourceLocation) {
    this.source = source;
  }

  /**
   * Calls the node specific method on the [visitor].
   */
  public abstract accept<R>(visitor: AstVisitor<R>): R;

  /**
   * Adds [node] as a child of this node and sets its parent to this node.
   */
  protected addChild(node: Node | null | undefined): void {
    if (!node) {
      return;
    }

    if (node.parent) {
      throw new Error("Parent already set.");
    }

    node.parent = this;
    this._children.push(node);
  }

  /**
   * Adds all [nodes] to this node as a child and sets their parent to this node.
   */
  protected addChildren(nodes: Array<Node | null | undefined>): void {
    for (const node of nodes) {
      if (!node) {
        continue;
      }

      if (node.parent) {
        throw new Error("Parent already set.");
      }

      node.parent = this;
      this._children.push(node);
    }
  }

  /**
   * Finds the first parent node by the given type recursively, or `null`.
   */
  public findParentByType<T extends Node>(
    ctor: new (...args: any[]) => T
  ): T | null {
    let curParent = this.parent;

    while (curParent !== null) {
      if (curParent instanceof ctor) {
        return curParent;
      }
      curParent = curParent.parent;
    }

    return null;
  }

  /**
   * Helper function to report a diagnostic with the type of [DiagnosticType.INFO].
   */
  public reportInfo(diagnostics: Diagnostics, message: string, ...args: unknown[]) {
      diagnostics.report(new Diagnostic(DiagnosticType.INFO, this, message, ...args));
  }

  /**
   * Helper function to report a diagnostic with the type of [DiagnosticType.WARNING].
   */
  public reportWarning(diagnostics: Diagnostics, message: string, ...args: unknown[]) {
      diagnostics.report(new Diagnostic(DiagnosticType.WARNING, this, message, ...args));
  }
  
  /**
   * Helper function to report a diagnostic with the type of [DiagnosticType.ERROR].
   */
  public reportError(diagnostics: Diagnostics, message: string, ...args: unknown[]) {
      diagnostics.report(new Diagnostic(DiagnosticType.ERROR, this, message, ...args))
  }
}
