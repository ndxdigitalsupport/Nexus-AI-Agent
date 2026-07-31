// Serverless proxy for AI chat completions.
// Keeps the server-side API key out of the browser bundle.
// The client calls this endpoint when no user-supplied key is configured.
// Supports both streaming (SSE) and non-streaming requests.

/* eslint-disable @typescript-eslint/no-explicit-any -- Vercel handler req/res are untyped */

export const config = { runtime: 'nodejs' };

const AI_ENDPOINT = process.env.AI_ENDPOINT || 'https://gpt-agent.cc/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL;
  const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
  const stream = body.stream !== false;

  try {
    const upstream = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages: body.messages, temperature, stream })
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
