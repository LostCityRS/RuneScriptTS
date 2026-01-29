import { Hashable } from '../runescript/util/Hashable';
import { JavaObjects } from '../runescript/util/JavaObjects';
import { ToStringHelper } from '../runescript/util/ToStringHelper';

export class NodeSourceLocation implements Hashable {
  public readonly name: string;
  public readonly line: number;
  public readonly column: number;

  constructor(name: string, line: number, column: number) {
    this.name = name;
    this.line = line;
    this.column = column;
  }

  hashCode(): number {
    return JavaObjects.hash(this.name, this.line, this.column);
  }

  equals(other: unknown): boolean {
    if (this === other) return true;
    if (!(other instanceof NodeSourceLocation)) return false;
    return (
      JavaObjects.equals(this.name, other.name) &&
      JavaObjects.equals(this.line, other.line) &&
      JavaObjects.equals(this.column, other.column)
    );
  }

  toString(): string {
    return new ToStringHelper(this)
      .add("name", this.name)
      .add("line", this.line)
      .add("column", this.column)
      .toString();
  }
}
