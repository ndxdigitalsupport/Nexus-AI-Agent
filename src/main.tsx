import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App'
import './index.css'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || ''
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {SENTRY_DSN ? (
      <Sentry.ErrorBoundary fallback={<div className="h-full w-full flex items-center justify-center bg-[#070913] text-slate-300 font-mono text-sm p-6 text-center">Something went wrong. Please refresh the page.</div>}>
        <App />
      </Sentry.ErrorBoundary>
    ) : (
      <App />
    )}
  </StrictMode>,
)
