# Aria — Web Frontend

Next.js 14 · Tailwind · TanStack Query · TypeScript

## Quickstart

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
npm run dev                         # http://localhost:3000
```

## Structure

```
app/
  (auth)/          login, register pages
  (dashboard)/     chat, tasks, notes, settings — all need auth
  layout.tsx       root layout + providers
  page.tsx         redirects → /chat or /login
components/
  chat/            MessageBubble, ChatInput
  layout/          Sidebar
  ui/              Button, Card, Input, PresenceThread
hooks/
  useChat.ts       SSE streaming chat state
lib/
  auth.tsx         AuthContext — token storage, login/logout
  theme.tsx        ThemeContext — CSS var injection per theme
packages/
  api-client/      typed fetch wrapper for all backend endpoints
  tokens/          design tokens (colors, type, spacing)
  ui/              shared pure-TS utilities (formatRelative, initials…)
styles/
  globals.css      Tailwind base + theme CSS vars + animations
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright E2E (needs backend + dev server running) |
| `npm run lint` | ESLint |

## Deploy to Vercel

```bash
vercel link
vercel env add NEXT_PUBLIC_API_URL   # https://your-backend.fly.dev
vercel --prod
```
