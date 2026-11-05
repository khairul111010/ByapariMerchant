/**
 * Courtesy check for a banner link. The server is authoritative (its message says: a path
 * starting with / or a full http(s):// address); the rules also allow mailto: and tel:.
 * Blocks javascript: and data:, and protocol-relative `//host` links (they point at another site, not a path).
 */
export const isSafeBannerLink = (url: string): boolean => {
  const v = url.trim();
  return (
    v === '' || /^(https?:\/\/\S+|mailto:\S+|tel:\S+|\/(?!\/)\S*)$/i.test(v)
  );
};

/** New full order after moving one id up or down by one place, or null at the edge. */
export function moveId(
  ids: number[],
  id: number,
  dir: 'up' | 'down',
): number[] | null {
  const at = ids.indexOf(id);
  const to = dir === 'up' ? at - 1 : at + 1;
  if (at === -1 || to < 0 || to >= ids.length) {
    return null;
  }
  const next = [...ids];
  [next[at], next[to]] = [next[to], next[at]];
  return next;
}
