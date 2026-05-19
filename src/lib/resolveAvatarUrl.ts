export function resolveAvatarUrl(
  userId: string,
  rawAvatarUrl: string | null,
): string | null {
  if (!rawAvatarUrl) return null;
  if (rawAvatarUrl.startsWith('https://')) {
    return `/api/profile/avatar/${userId}`;
  }
  return rawAvatarUrl;
}
