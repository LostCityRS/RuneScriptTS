import { Hashable } from './Hashable.ts';
import { javaStringHash } from './JavaStringHash.ts';

export class JavaObjects {
  static hash(...values: unknown[]): number {
    let result = 1;

    for (const v of values) {
      result = (31 * result + JavaObjects.hashValue(v)) | 0; // 32-bit signed overflow
    }

    return result;
  }

  static hashValue(value: unknown): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "string") {
      return javaStringHash(value);
    }

    if (typeof value === "boolean") {
      return value ? 1231 : 1237;
    }

    if (typeof value === "number") {
      if (!Number.isInteger(value)) {
        throw new Error(`Non-integer number ${value} cannot be hashed safely in Java-compatible way`);
      }
      return value | 0;
    }

    if (typeof value === "object") {
      if ("hashCode" in value && typeof (value as any).hashCode === "function") {
        return (value as Hashable).hashCode();
      }
      // fallback: string representation
      return javaStringHash(String(value));
    }

    // fallback for unknown types
    return javaStringHash(String(value));
  }

  static equals(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a === null || a === undefined || b === null || b === undefined) {
      return false;
    }

    if (typeof a === "object" && "equals" in a && typeof (a as any).equals === "function") {
      return (a as Hashable).equals(b);
    }

    return a === b;
  }
}
