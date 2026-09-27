/**
 * Minimal in-memory sliding-window rate limiter for public forms
 * (Architecture.md §5/§10). Suitable for a single instance.
 * Production with multiple instances should use a shared store.
 */
const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const times = (hits.get(key) ?? []).filter((t) => t > windowStart);
  if (times.length >= limit) {
    hits.set(key, times);
    return false;
  }
  times.push(now);
  hits.set(key, times);
  // Prevent unbounded growth in long-running dev sessions.
  if (hits.size > 5000) {
    const oldest = [...hits.entries()].sort((a, b) => (a[1][0] ?? 0) - (b[1][0] ?? 0));
    for (const [k] of oldest.slice(0, 1000)) hits.delete(k);
  }
  return true;
}
