# CLAUDE.md — Artist Intel (Next.js App)

## Always Do First
- **Read `DESIGN_BRIEF.md`** before writing any UI code, every session, no exceptions.
- **Read `design-refs/ref1.webp` through `ref5.webp`** when building any dashboard component.
- The reference images show the exact visual target. Match layout, spacing, typography, and color.

---

## Project Stack
- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (Postgres + Auth + Storage)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **PDF:** @react-pdf/renderer
- **Email:** Resend
- **Payments:** Stripe
- **Charts:** Recharts
- **Platform:** MacOS — all paths are Unix (`/`, not `C:\`)

---

## Local Dev Server
- Start: `npm run dev` (runs on `http://localhost:3000`)
- Never use `node serve.mjs` — this is Next.js, not a static server
- If port 3000 is in use: `npm run dev -- --port 3001`
- Check if running: `lsof -ti:3000`
- Kill if needed: `kill -9 $(lsof -ti:3000)`

---

## Screenshot Workflow (MacOS)
- Puppeteer: install locally if not present — `npm install puppeteer --save-dev`
- Screenshot command: `node screenshot.mjs http://localhost:3000/dashboard`
- Screenshots saved to `./screenshots/screenshot-N.png`
- After screenshotting, read the PNG and compare against `design-refs/` images
- Do at least 2 comparison rounds before stopping
- Be specific when comparing: "card border-radius is 8px but DESIGN_BRIEF says 12px"
- Check: spacing, font size/weight, colors (exact hex from DESIGN_BRIEF), border-radius, shadows

**`screenshot.mjs` — create this in project root if it doesn't exist:**
```js
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const dir = './screenshots';
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const n = files.length + 1;
const name = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.screenshot({ path: path.join(dir, name), fullPage: false });
await browser.close();
console.log(`Saved: ${path.join(dir, name)}`);
```

---

## Design System (summary — full spec in DESIGN_BRIEF.md)
- **Font:** DM Sans (Google Fonts) — add to `app/layout.tsx`
- **Page bg:** `#E8E8EA` (warm gray — the "desk")
- **Cards:** `#FFFFFF`, `border-radius: 12px`, `border: 0.5px solid rgba(0,0,0,0.07)`, subtle shadow
- **Sidebar:** white, 220px, no dark background
- **Accent:** `#E8442A` (coral red — primary CTAs, active states, chart line 1)
- **Positive delta:** `#1A9E5C` (green, no background — inline text only)
- **Negative delta:** `#9B9BA4` (muted gray — not alarming red)
- **All stat numbers:** `font-variant-numeric: tabular-nums`
- **Column headers:** uppercase, 11px, `#9B9BA4`, letter-spacing 0.06em
- **No dark sidebar. No Inter. No default Tailwind blues as accent.**

---

## File & Folder Conventions
```
app/
  (auth)/           ← login, callback routes
  (dashboard)/      ← all protected pages
    layout.tsx      ← sidebar + shell layout
    page.tsx        ← redirect to first artist
    [artistId]/
      page.tsx      ← main dashboard
      pitches/
        page.tsx    ← pitch history
        new/
          page.tsx  ← pitch builder
      reports/
        page.tsx    ← report history
  api/
    auth/
      spotify/      ← connect + callback
    spotify/
      sync/         ← data pull
    generate/
      pitch/        ← Claude generation
      report/
    pdf/
      pitch/[id]/   ← PDF render + serve
      report/[id]/
    reports/
      send/         ← Resend email
    stripe/
      checkout/
      webhook/
components/
  ui/               ← shadcn/ui auto-generated
  dashboard/        ← app-specific components
    MetricStrip.tsx
    TrendChart.tsx
    TrackTable.tsx
    RightRail.tsx
    Sidebar.tsx
  pdf/
    PitchPDF.tsx
    ReportPDF.tsx
lib/
  supabase.ts       ← Supabase client (browser)
  supabase-server.ts← Supabase client (server)
  spotify.ts        ← Spotify API helpers
  anthropic.ts      ← Claude API client
  utils.ts
```

---

## Supabase Patterns
- Browser client: `lib/supabase.ts` using `createBrowserClient`
- Server client: `lib/supabase-server.ts` using `createServerClient` with cookie handling
- Always use server client in Server Components and API routes
- Always use browser client in Client Components (`'use client'`)
- RLS is active — always pass auth context, never bypass with service role key in client code
- Service role key is only used in Edge Functions and cron jobs

```ts
// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(),
                  setAll: (c) => c.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options)) } }
  )
}
```

---

## Claude API Patterns
- Model: always `claude-sonnet-4-20250514`
- Max tokens: 4096 for generation, 1024 for short tasks
- Always stream pitch and report generation — show content appearing in real time
- Wrap all Claude calls in try/catch — surface errors gracefully in UI

```ts
// lib/anthropic.ts
import Anthropic from '@anthropic-ai/sdk'
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})
```

---

## Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never expose to client

# Spotify
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=            # http://localhost:3000/api/auth/spotify/callback

# Anthropic
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=               # reports@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=             # http://localhost:3000
```
Never commit `.env.local`. Always add to Vercel environment variables before deploying.

---

## Anti-Generic Guardrails (inherited + adapted)
- **Colors:** Use exact hex values from DESIGN_BRIEF.md — never default Tailwind palette
- **Shadows:** `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)` — barely-there float
- **Typography:** DM Sans only. Tabular-nums on all stat figures. No Inter, no Roboto.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`.
- **Interactive states:** Every button/row/card needs hover + focus-visible + active. No exceptions.
- **Loading states:** Skeleton shimmer matching exact shape of real content. Never a spinner on data.
- **Numbers counting up:** Stats animate from 0 on mount, 600ms ease-out. Once only.
- **Spacing:** Follow the 4/8/12/16/24/32/48px token scale in DESIGN_BRIEF.md exactly.

## Hard Rules
- Do not add features or sections not asked for
- Do not use dark sidebar — the design is all-white
- Do not use `transition-all`
- Do not use default Tailwind indigo/blue as accent — accent is `#E8442A`
- Do not stop after one screenshot pass — always do 2+ comparison rounds
- Do not use `px` for font sizes in Tailwind — use the configured scale
- Do not import server-only code into Client Components
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` to the browser