type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

// Purge expired entries to prevent unbounded memory growth in long-running processes.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref?.();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true; remaining: number; resetAt: number } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count++;
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}
