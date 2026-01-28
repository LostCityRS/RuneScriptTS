export interface Hashable {
  hashCode(): number;
  equals(other: unknown): boolean;
}