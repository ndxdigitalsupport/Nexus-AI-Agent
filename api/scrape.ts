// Serverless web scraper used by the Knowledge Base "Index Website URL" feature.
// Fetches pages server-side so user-supplied URLs are not leaked through
// third-party public CORS proxies, and blocks private/internal addresses.

/* eslint-disable @typescript-eslint/no-explicit-any -- Vercel handler req/res are untyped */

import { lookup } from 'dns/promises';

export const config = { runtime: 'nodejs' };

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15000;

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  return (
    h === 'localhost' ||
    h === 'localhost.localdomain' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h === '[::1]' ||
    h === 'metadata.google.internal' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.endsWith('.localhost') ||
    /^10\.\d+\.\d+\.\d+$/.test(h) ||
    /^127\.\d+\.\d+\.\d+$/.test(h) ||
    /^169\.254\.\d+\.\d+$/.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(h) ||
    /^192\.168\.\d+\.\d+$/.test(h)
  );
}

async function isPublicAddress(hostname: string): Promise<boolean> {
  if (isPrivateHostname(hostname)) return false;
  try {
    const { address } = await lookup(hostname, { verbatim: true });
    if (isPrivateHostname(address)) return false;
    const parts = address.split('.').map(Number);
    if (parts.length === 4) {
      const [a, b] = parts;
      if (a === 10) return false;
      if (a === 127) return false;
      if (a === 169 && b === 254) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
    }
    return true;
  } catch {
    return false;
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = readJsonBody(req);
  const rawUrl = body?.url;
  if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    return res.status(400).json({ error: 'Missing "url" in request body.' });
  }

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only http and https URLs are supported.' });
  }

  if (!(await isPublicAddress(url.hostname))) {
    return res.status(400).json({ error: 'This URL is not allowed (private or internal addresses are blocked).' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url.href, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NexusAIKnowledgeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Target site responded with HTTP ${response.status}.` });
    }

    const reader = response.body?.getReader();
    let html = '';
    if (reader) {
      const decoder = new TextDecoder('utf-8');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
        if (html.length > MAX_RESPONSE_BYTES) {
          return res.status(413).json({ error: 'Page content is too large to index.' });
        }
      }
    }

    return res.status(200).json({ html });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return res.status(504).json({ error: 'The target site took too long to respond.' });
    }
    console.error('Scrape proxy error:', err?.message || err);
    return res.status(502).json({ error: 'Failed to fetch the target URL.' });
  }
}
