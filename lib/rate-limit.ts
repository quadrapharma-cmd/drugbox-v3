// ============================================================
// Rate limiting — sliding window via Upstash Redis REST API.
// Used on sensitive actions: login, signup, message send, listing create.
// Falls open (allows the request) if Redis is unconfigured, so local dev
// without Redis still works — but in production the env vars must be set.
// ============================================================

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

interface RateLimitResult {
  success: boolean
  remaining: number
}

/**
 * Sliding-window rate limit.
 * @param key      unique identifier (e.g. `login:${ip}` or `msg:${userId}`)
 * @param limit    max requests allowed in the window
 * @param windowSec window size in seconds
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  // If Redis isn't configured (local dev), allow the request.
  if (!REDIS_URL || !REDIS_TOKEN) {
    return { success: true, remaining: limit }
  }

  const now = Date.now()
  const windowStart = now - windowSec * 1000
  const redisKey = `ratelimit:${key}`

  try {
    // Use a Redis pipeline: remove old entries, count, add current, set expiry
    const res = await fetch(`${REDIS_URL}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['ZREMRANGEBYSCORE', redisKey, '0', String(windowStart)],
        ['ZCARD', redisKey],
        ['ZADD', redisKey, String(now), `${now}-${Math.random()}`],
        ['EXPIRE', redisKey, String(windowSec)],
      ]),
    })

    if (!res.ok) {
      // On Redis error, fail open rather than blocking legitimate users
      return { success: true, remaining: limit }
    }

    const data = await res.json()
    const count = data[1]?.result ?? 0
    const remaining = Math.max(0, limit - count - 1)

    return { success: count < limit, remaining }
  } catch {
    // Network error talking to Redis → fail open
    return { success: true, remaining: limit }
  }
}
