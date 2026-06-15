// Single source of truth for absolute URLs used in SEO metadata (canonical,
// hreflang, Open Graph, sitemap). Override at build time with VITE_SITE_URL.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://sumly.uz').replace(/\/$/, '');
