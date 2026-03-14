/**
 * Simple in-memory rate limiter.
 * Not suitable for multi-instance deployments (use Redis/Upstash in production).
 */

type RateLimitEntry = { count: number; resetAt: number }

const store = new Map<string, RateLimitEntry>()

/**
 * Check if a key is within the rate limit.
 * @param key      Unique key (e.g. IP + route)
 * @param limit    Max requests allowed per window
 * @param windowMs Rolling window in milliseconds
 * @returns `{ allowed: boolean, remaining: number }`
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count }
}
