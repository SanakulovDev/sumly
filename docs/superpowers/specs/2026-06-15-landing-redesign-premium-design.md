# Sumly Landing Redesign — Premium "Living Product" Landing

**Date:** 2026-06-15
**Status:** Approved
**Supersedes the visual scope of:** `2026-06-15-landing-page-seo-design.md` (SEO/prerender architecture from that spec is retained unchanged)

## Problem

The current landing page works and is correctly prerendered in 3 languages with full SEO, but it feels "too small and pointless." It does not convince a first-time visitor that Sumly is worth signing up for. The app itself is (and stays) login-gated — so the landing is the only thing a guest sees, and it must be impressive enough that visitors are *amazed and want to try it*.

## Goal

Redesign the public landing into a premium, SaaS-grade marketing page that:
- Showcases the product with a **live, interactive demo** (visitors "see" it working).
- Feels alive through **motion and polish**.
- Backs the pitch with **richer, honest content** (no fabricated testimonials or user counts).
- Has a **bold, distinctive identity** that stands out in the Uzbek market.
- Drives the single conversion action: **Sign up (free)**.

## Non-Goals / Constraints

- **No login wall on the landing.** Visitors see the full landing; the *app* stays gated behind auth (unchanged). Confirmed flow: stunning public landing → sign up / log in.
- **No new runtime dependencies.** Motion via CSS keyframes + a small `IntersectionObserver` hook; charts via hand-rolled SVG. This preserves the existing SSR-prerender pipeline and the lean Docker build.
- **No fabricated social proof.** Proof is capability-based and verifiable (3 languages, AI receipt scan, free, so'm-native, secure). Real testimonials can be added later.
- **Pricing:** "Free to start" framed as a hook. A prominent free callout band, **not** a pricing table.
- Routing, SSR entry, `prerender.mjs`, `landingMeta`/SEO/sitemap, and nginx config remain functionally unchanged.

## Decisions

### Visual identity
- Retain the emerald/teal `brand` palette; introduce a **gradient/aurora system** (emerald → teal → cyan) for the hero glow, final CTA, and gradient accent text. Subtle dotted-grid texture behind the hero.
- **Display hero typography**: very large, tight letter-spacing; gradient-filled accent word.
- **Glass cards** (`backdrop-blur`, hairline border, `shadow-lifted`) for the demo and feature tiles.
- Full **light + dark** support, designed and reviewed in both modes.
- New tokens in `tailwind.config.js` (gradient stops + `aurora`/`float`/`reveal` keyframes) and reusable classes in `index.css`.

### Centerpiece: interactive product demo
Replaces the static `DashboardPreview` with a glass panel exposing **3 tabs** the visitor can click:
- **Dashboard** — balance card with **count-up** numbers, an animated **SVG chart** (bars grow / line draws on reveal), staggered-in transaction list.
- **Add transaction** — a mini form that fills itself in (type → amount → category → cash/card).
- **Receipt scan** — a receipt image with a **scanning line** sweeping down, then the parsed amount animating into the form (the "magic" moment).

SSR renders the **Dashboard tab statically** so crawlers and no-JS users see real content. Tab switching and all animation are progressive enhancement. The panel is `aria-hidden` where purely decorative; tabs are keyboard-accessible with ARIA where interactive.

### Page sections (top → bottom)
1. **Header** — sticky, turns glassy on scroll; language pills; Log in / **Sign up**.
2. **Hero** — badge, gradient display headline, subtitle, primary **Get started free** + secondary Log in, interactive demo.
3. **Trust strip** — honest badges: Free · 3 languages · AI receipt scan · Works on any phone · Data secured.
4. **Value props ("Why Sumly")** — 3 problem→solution cards.
5. **Feature deep-dives** — the existing 6 features in a richer alternating layout, each with a small visual, scroll-revealed.
6. **Receipt-scan showcase** — expanded section reusing the scan animation, with step labels.
7. **Comparison** — honest, factual table: Sumly vs. spreadsheet / paper notebook (entry speed, works on phone, auto reports, receipt scan, your language).
8. **Languages** — instant en/ru/uz switch; so'm-native.
9. **Free callout** — prominent "Free to start" band (no pricing table).
10. **FAQ** — accordion (is it free, my data, offline, languages, export).
11. **Final CTA** — full-width gradient, big **Get started free**.
12. **Footer** — expanded: columns + language links.

### Content / i18n
Extend the `LandingCopy` interface with the new sections (value props, comparison rows, FAQ entries, free-callout, demo labels). Author all three languages — English is the source of truth, then Russian and Uzbek. The existing copy keys are preserved/extended, not removed.

### Motion & accessibility
- `useReveal` hook (IntersectionObserver) adds a reveal class as elements scroll into view.
- An inline `js-reveal` flag set on `<html>` early means content is **visible by default** without JS, so SEO/no-JS users lose nothing; the reveal animation only applies when JS is present.
- All motion respects `prefers-reduced-motion` (animations disabled, content shown instantly).
- Tabs and the FAQ accordion are fully keyboard-accessible with correct ARIA roles/states.

## Components

New / changed under `frontend/src/components/landing/`:
- `ProductDemo.tsx` (new) — the interactive 3-tab demo; replaces use of `DashboardPreview` in the hero. `DashboardPreview` content is folded into the Dashboard tab.
- `ValueProps.tsx` (new)
- `Comparison.tsx` (new)
- `FreeCallout.tsx` (new)
- `Faq.tsx` (new) — accessible accordion.
- `Hero.tsx`, `Features.tsx`, `ReceiptScan.tsx`, `LandingHeader.tsx`, `LandingFooter.tsx`, `TrustStrip.tsx`, `Languages.tsx`, `FinalCTA.tsx` — restyled to the new identity; props unchanged where possible.
- `useReveal.ts` (new hook, in `landing/` or `hooks/`).

Shared:
- `tailwind.config.js` — gradient stops + keyframes.
- `src/index.css` — aurora/gradient/reveal/glass utility classes.
- `src/i18n/landing.ts` — extended `LandingCopy` + en/ru/uz content.
- `src/pages/LandingPage.tsx` — composes the new section order.

## Data Flow

Static, copy-driven: `getLandingCopy(lang)` → `LandingPage` → section components via `copy` props. The interactive demo and reveal animations hold only local client state (active tab, in-view flag) and never call the API. SSR renders the default tab; hydration enables interactivity.

## Error Handling

Pure presentational page with no data fetching, so there are no runtime error paths to handle. Progressive enhancement is the safety net: if JS fails to load, the prerendered HTML still shows the full landing (default tab, all sections, no broken interactions).

## SEO / Prerender impact

All new sections are static copy and render server-side, so the prerender output still contains real content. The single-`<title>`, hreflang, canonical, OG/Twitter, JSON-LD, and sitemap behavior from the prior spec are unchanged. The interactive demo defaults to a server-rendered tab so no content is hidden from crawlers.

## Testing / Verification

- `npm run lint` and `npm run build` pass; `prerender.mjs` emits `dist/index.html`, `dist/ru/index.html`, `dist/uz/index.html` + `sitemap.xml`.
- Content assertions: hero headline (per language), new section copy (comparison, FAQ, free callout), `hreflang="x-default"`, JSON-LD, exactly one `<title>`, SPA module script preserved in each prerendered file.
- Visual review in browser at light **and** dark mode, desktop and mobile widths; verify reveal animations, tab switching, and `prefers-reduced-motion` fallback.
- Keyboard pass on tabs + FAQ accordion.
