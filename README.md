# NEXUS AI Agent

An AI agent workspace SPA (React + TypeScript + Vite) with streaming chat, personas, an auto-populating project/action board, a knowledge base with RAG-style retrieval, a document artifact studio (PDF/Word export), an admin dashboard, Supabase-backed accounts, and a Telegram bot webhook.

## Development

```bash
npm install
npm run dev
```

## Environment variables

Secrets are **never hardcoded** in source. Configure them in `.env.local` (local) or in the Vercel project settings (production).

### Server-side (Vercel functions only — never exposed to the browser)

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | API key used by the `/api/chat` proxy and `/api/telegram` webhook. Required for AI responses on the deployed site. |
| `TELEGRAM_BOT_TOKEN` | Bot token for the Telegram webhook. |
| `AI_ENDPOINT` | (Optional) Chat-completions endpoint. Defaults to `https://gpt-agent.cc/v1/chat/completions`. |

### Client-side (bundled — do NOT put secrets here)

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable (anon) key. |
| `VITE_OPENROUTER_API_KEY` / `VITE_DEEPSEEK_API_KEY` | (Optional) A developer's own key for local dev; when empty the app uses the server proxy. |
| `VITE_CHAT_PROXY_URL` | (Optional) Override the serverless chat proxy location. Defaults to `/api/chat`. |

## How AI requests stay secure in production

The client never holds the server API key. When no user-supplied key is configured:

1. The browser calls the `/api/chat` serverless proxy with the conversation payload.
2. The proxy injects `OPENAI_API_KEY` server-side and streams the response back.

Users can still bring their own key (Settings page); that key is sent only to their chosen endpoint.

## Admin roles

Admin access is granted solely by the `role` column of the account's row in the Supabase `profiles` table (`admin` vs `user`). To promote an account, update its profile row in the Supabase dashboard. Sign-ups always start as `user`; admin pages and features are hidden from non-admins.

## Checking the build

```bash
npm run check   # TypeScript typecheck
npm run lint    # ESLint
npm run build   # Production build
```
