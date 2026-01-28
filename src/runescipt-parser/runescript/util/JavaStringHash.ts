export function javaStringHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (31 * hash + s.charCodeAt(i)) | 0; // force 32-bit signed int
  }
  return hash;
}