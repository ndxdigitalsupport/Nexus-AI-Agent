// Serverless proxy for AI chat completions.
// Keeps the server-side API key out of the browser bundle.
// The client calls this endpoint when no user-supplied key is configured.
// Supports both streaming (SSE) and non-streaming requests.

/* eslint-disable @typescript-eslint/no-explicit-any -- Vercel handler req/res are untyped */

export const config = { runtime: 'nodejs' };

const AI_ENDPOINT = process.env.AI_ENDPOINT || 'https://gpt-agent.cc/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dabzjdeswxdhfcczprup.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3T2sWbwkD_jZDI8CQ9QgCw_u0edN5a-';

const MAX_MESSAGES = 60;
const MAX_TOTAL_CHARS = 120000; // combined conversation history cap (~30k tokens)
const MAX_OUTPUT_TOKENS = 4096;

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

// Verify a Supabase access token via the Auth REST API (no server-side SDK
// dependency). Returns the authenticated user id, or null when invalid/expired.
async function verifySessionToken(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return typeof data?.id === 'string' ? data.id : null;
  } catch {
    return null;
  }
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
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '';
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is not configured with an API key (OPENAI_API_KEY).' });
  }

  const body = readJsonBody(req);
  if (!body || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: 'Invalid request: messages array is required.' });
  }

  // --- Session authentication + rate limiting ---
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const userId = await verifySessionToken(token);

  if (token && !userId) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  // Authenticated users get a generous hourly budget; guests are strictly capped
  // so the shared server-side key cannot be drained anonymously.
  if (userId) {
    if (!enforceRateLimit(req, res, 120, 60 * 60 * 1000, `chat:user:${userId}`)) return;
  } else if (!enforceRateLimit(req, res, 5, 60 * 60 * 1000, `chat:guest:${getClientIp(req)}`)) {
    return;
  }

  // --- Cost guards: bound request size so a single call cannot run away ---
  if (body.messages.length > MAX_MESSAGES) {
    return res.status(400).json({ error: `Too many messages (max ${MAX_MESSAGES} per request).` });
  }
  const totalChars = body.messages.reduce(
    (sum: number, m: any) => sum + (typeof m?.content === 'string' ? m.content.length : 0),
    0
  );
  if (totalChars > MAX_TOTAL_CHARS) {
    return res.status(400).json({ error: 'Conversation is too long. Start a new conversation and try again.' });
  }

  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL;
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const stream = body.stream !== false;

  const upstreamBody: Record<string, any> = { model, messages: body.messages, temperature, stream };
  if (typeof body.max_tokens === 'number') {
    upstreamBody.max_tokens = Math.min(Math.floor(body.max_tokens), MAX_OUTPUT_TOKENS);
  }

  try {
    const upstream = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(upstreamBody)
    });

    if (stream) {
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/event-stream; charset=utf-8');
      res.flushHeaders?.();
      if (!upstream.body) {
        return res.end();
      }
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    }

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(text);
  } catch (err: any) {
    console.error('Chat proxy error:', err?.message || err);
    return res.status(502).json({ error: err?.message || 'Upstream request failed.' });
  }
}
