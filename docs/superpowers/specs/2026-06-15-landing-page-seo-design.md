# Sumly Landing Page + SEO — Design

**Date:** 2026-06-15
**Status:** Approved (pending final spec review)

## Goal

Add a public marketing landing page for Sumly that immediately communicates the
product and converts visitors to **sign up**. It must be available in three
languages — **English (main/canonical), Russian, Uzbek** — and be properly
indexable by search engines and social crawlers (Google, Bing, Yandex, social
link previews).

## Key Decisions

| Decision | Choice |
|---|---|
| SEO approach | **Prerender the landing routes to static HTML** at build time. The app stays a client-rendered SPA. |
| Primary CTA | **Sign up / Register.** Secondary: Log in. |
| Root routing | `/` shows the landing page to **logged-out** visitors; **logged-in** users are redirected to the dashboard. Existing app routes unchanged. |
| Language URLs | Path prefixes: `/` (English, canonical), `/ru` (Russian), `/uz` (Uzbek). Each prerendered with its own `hreflang`. |
| Default language | First-time visitors get English at `/`. A saved language preference is respected for redirect, but English remains canonical (`x-default`). |
| Visual direction | **Centered bold hero** on Sumly's emerald gradient, dashboard preview below the headline. |
| Out of scope | Pricing, testimonials, FAQ, live/guest demo mode (product is free and pre-launch). |

## Page Content & Sections (top → bottom)

1. **Sticky header** — `Logo` + wordmark; anchor nav (Features · How it works ·
   Languages); language switcher (EN/RU/UZ); `Log in`; `Sign up` (primary).
   Collapses to a compact menu on mobile.
2. **Hero** — eyebrow badge ("Money, made simple"); large headline
   ("Know exactly where your money goes."); subhead; primary CTA
   **Get started free →** + secondary `Log in`; dashboard preview below.
3. **Trust strip** — one line: "Free · 3 languages · Works on any phone · Export to Excel".
4. **Features grid (6 cards)** — Fast entry · Receipt scan (AI) · Cash or card
   (last 4 digits) · Live dashboard · Powerful filters & reports · Excel export.
   Each: icon + 1-line benefit. Reuses existing `icons.tsx` where possible.
5. **How it works (3 steps)** — Sign up → Add a transaction → See your balance & reports.
6. **Receipt-scan highlight** — spotlight the Gemini receipt-photo scan feature.
7. **Built for Uzbekistan / 3 languages** — emphasize uz/ru/en, so'm, mobile-first.
8. **Final CTA band** — "Start tracking every so'm — free." + Sign up button.
9. **Footer** — logo; language links (`/`, `/ru`, `/uz`); Log in / Sign up; copyright.

## Technical Architecture

### Routing

- New public route component `pages/LandingPage.tsx`, rendered **outside**
  `ProtectedRoute`, at:
  - `/` → English
  - `/ru` → Russian
  - `/uz` → Uzbek
- `/` behavior:
  - **Logged out** → render `LandingPage`.
  - **Logged in** → redirect to the dashboard.
- The current dashboard at `/` moves to render under an authenticated check so
  `/` can be shared between landing (guest) and dashboard (user). All other
  existing app routes (`/transactions`, `/reports`, `/settings`, auth pages,
  etc.) remain exactly as they are.
- Language for the landing is fixed by the route (not the global app language
  store), so each prerendered URL is deterministic. First-paint redirect logic
  may honor a saved preference, but English is canonical.

### Components

- `components/landing/` — small, self-contained section components:
  `LandingHeader`, `Hero`, `TrustStrip`, `Features`, `HowItWorks`,
  `ReceiptScan`, `Languages`, `FinalCTA`, `LandingFooter`.
- Reuse existing `Logo`, `btn`/`btn-primary`/`btn-secondary`, `card`, and brand
  color tokens. No new design system.
- Each section reads its copy from the landing dictionary by key.

### Copy / i18n

- New `i18n/landing.ts` with `en`/`ru`/`uz` dictionaries, separate from the app
  dictionaries to keep marketing copy isolated.
- **English is authored first** as the source of truth; RU and UZ are
  translations of the English copy.
- A small `useLandingT(lang)` helper resolves keys for the route-fixed language
  (mirrors the existing `useT` resolve/interpolate approach).

### SEO meta (runtime + prerendered)

- A tiny `useSeo()` hook (no new dependency) sets per-language:
  - `<title>`, `<meta name="description">`
  - `<link rel="canonical">`
  - `hreflang` alternates: `en` → `/`, `ru` → `/ru`, `uz` → `/uz`,
    `x-default` → `/`
  - Open Graph (`og:title`, `og:description`, `og:image`, `og:locale`,
    `og:url`, `og:type`) + Twitter card tags
  - JSON-LD structured data (`SoftwareApplication` + `Organization`)
- `<html lang>` set per language.

## SEO — Prerendering

- Add a **build-time prerender step** that renders `/`, `/ru`, `/uz` to static
  HTML containing the full hero/feature text (not an empty `<div id="root">`).
  Output:
  - `dist/index.html` (English)
  - `dist/ru/index.html` (Russian)
  - `dist/uz/index.html` (Uzbek)
- **Tooling:** choose the lightest reliable option at planning time (a small
  custom post-build script using `puppeteer` to render the built app, or Vite
  SSR). No heavy meta-framework (no Next.js migration). Decision recorded in the
  implementation plan.
- Each prerendered file includes the correct `lang`, title, description,
  canonical, `hreflang` alternates (incl. `x-default`), OG/Twitter tags, and
  JSON-LD.
- Add to `public/`: `sitemap.xml` (3 language URLs with `hreflang`) and
  `robots.txt` (allow all, link sitemap).
- Add an OG share image (`public/og-image.png` or generated) for link previews.
- Update `nginx.conf` so `/ru` and `/uz` serve their prerendered HTML, with SPA
  fallback for app routes; ensure `Cache-Control` is sensible for HTML vs assets.

## Verification

- `npm run build` succeeds; inspect the three HTML files and confirm they
  contain real headline/feature text in the page body.
- Confirm each file has correct `lang`, `<title>`, description, canonical,
  `hreflang`, OG tags, and JSON-LD.
- Validate the OG preview renders (title/description/image).
- Manually verify: logged-out `/` shows the landing; logged-in `/` redirects to
  dashboard; `/ru` and `/uz` render translated content; language switcher links
  navigate between the three URLs; existing app routes unaffected.
- Lighthouse SEO pass on the prerendered landing (target ≥ 95).

## Risks / Notes

- Prerendering with puppeteer adds a build-time dev dependency and a Chromium
  download in the build image — acceptable; confined to the build stage of the
  frontend Dockerfile.
- Keep the landing bundle lean so the prerendered HTML and first paint stay fast
  (the landing is the SEO-critical, LCP-sensitive surface).
