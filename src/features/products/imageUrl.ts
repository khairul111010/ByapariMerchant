/** Image paths come back relative (`/storage/...`); prefix the store's own origin. */
export function absoluteUrl(path: string | null | undefined, apiBaseUrl: string | null): string | undefined {
  if (!path) {
    return undefined;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const origin = apiBaseUrl?.match(/^https?:\/\/[^/]+/i)?.[0];
  return origin ? `${origin}${path.startsWith('/') ? '' : '/'}${path}` : undefined;
}
