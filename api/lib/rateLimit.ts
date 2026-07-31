// Lightweight in-memory fixed-window rate limiter for Vercel serverless functions.
// Each warm function instance keeps its own counters, so this is a cheap guard
// against casual abuse — not a strict distributed limit.

/* eslint-disable @typescript-eslint/no-explicit-any -- Vercel req/res are untyped */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function getClientIp(req: any): string {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Applies a rate limit and writes a 429 response when exceeded.
// Returns true when the request may continue, false when a response was already sent.
export function enforceRateLimit(
  req: any,
  res: any,
  limit: number,
  windowMs: number,
  key: string
): boolean {
  const result = rateLimit(key, limit, windowMs);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  if (!result.ok) {
    res.setHeader('Retry-After', String(result.retryAfter));
    res.status(429).json({ error: 'Too many requests. Please slow down and try again later.' });
    return false;
  }
  return true;
}
