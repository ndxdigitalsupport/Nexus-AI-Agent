// Serverless web-search proxy for the NEXUS agent.
// Uses the Tavily Search API (server-side key only, never shipped to the
// browser) and returns trimmed results that can be injected as context so the
// AI can answer current-information questions.

/* eslint-disable @typescript-eslint/no-explicit-any -- Vercel handler req/res are untyped */

export const config = { runtime: 'nodejs' };

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

const MAX_QUERY_LENGTH = 500;
const MAX_RESULTS = 5;

// --- In-memory rate limiter (per warm function instance) ---
interface Bucket { count: number; resetAt: number }
const buckets = new Map<string, Bucket>();

function getClientIp(req: any): string {
  const fwd = req.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();
  const realIp = req.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return req.socket?.remoteAddress || 'unknown';
}

function enforceRateLimit(req: any, res: any, limit: number, windowMs: number, key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(limit - 1));
    return true;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', '0');
    res.status(429).json({ error: 'Too many requests. Please slow down and try again later.' });
    return false;
  }
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(limit - bucket.count));
  return true;
}

function readJsonBody(req: any): any {
  if (req.body && typeof req.body === 'object') return req.body;
  if (req.body && typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TAVILY_API_KEY) {
    return res.status(501).json({ error: 'Web search is not configured (TAVILY_API_KEY missing).' });
  }

  if (!enforceRateLimit(req, res, 30, 60 * 60 * 1000, `search:${getClientIp(req)}`)) return;

  const body = readJsonBody(req);
  const query = body?.query;
  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Missing "query" in request body.' });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: 'Query is too long.' });
  }

  try {
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query.trim(),
        max_results: MAX_RESULTS,
        search_depth: 'basic',
        include_answer: false
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(502).json({ error: data?.error || 'Search provider request failed.' });
    }

    const results = (data.results || []).map((r: any) => ({
      title: r.title || '',
      url: r.url || '',
      content: (r.content || '').slice(0, 800)
    }));

    return res.status(200).json({ results, answer: data.answer || '' });
  } catch (err: any) {
    console.error('Search proxy error:', err?.message || err);
    return res.status(502).json({ error: err?.message || 'Search failed.' });
  }
}
