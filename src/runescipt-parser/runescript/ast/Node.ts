import { AstVisitor } from './AstVisitor';
import { NodeSourceLocation } from './NodeSourceLocation';

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

  protected constructor(
    public readonly source: NodeSourceLocation
  ) {}

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

    if (node.parent !== null) {
      throw new Error("parent already set");
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

      if (node.parent !== null) {
        throw new Error("parent already set");
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
   * Returns an attribute based on the given [key].
   */
  public getAttribute<T>(key: string): T | null {
    return (this.attributes.get(key) as T) ?? null;
  }

  /**
   * Adds (or replaces) an attribute with the given [key] with a value [value].
   */
  public putAttribute<T>(key: string, value: T | null): T | null {
    this.attributes.set(key, value);
    return value;
  }

  /**
   * Removes an attribute with the given [key].
   */
  public removeAttribute(key: string): void {
    this.attributes.delete(key);
  }

  // mark abstract so all nodes have to implement
  public abstract hashCode(): number;
  public abstract equals(other: unknown): boolean;
  public abstract toString(): string;

  /**
   * Returns a getter/setter pair for accessing attributes.
   * If the attribute is not found an error is thrown.
   */
  public static attribute<T>(key: string) {
    return {
      get(node: Node): T {
        if (node.attributes.has(key)) {
          return node.getAttribute<T>(key) as T;
        }
        throw new Error(`Attribute '${key}' should be initialized before get.`);
      },
      set(node: Node, value: T): void {
        node.putAttribute(key, value);
      }
    };
  }

  /**
   * Returns a getter/setter pair for accessing attributes.
   * If the attribute is not defined the return value is `null`.
   */
  public static attributeOrNull<T>(key: string) {
    return {
      get(node: Node): T | null {
        return node.getAttribute<T>(key);
      },
      set(node: Node, value: T | null): void {
        node.putAttribute(key, value);
      }
    };
  }
}
