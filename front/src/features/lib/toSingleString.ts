export function toSingleString(
  v: string | string[] | undefined | null
): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] : v;
}
