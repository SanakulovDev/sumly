import type { SeoMeta } from './landingMeta';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Builds the <head> tag string injected into prerendered HTML. Order/content
// must mirror what useSeo applies at runtime so static and SPA agree.
export function renderHeadTags(meta: SeoMeta): string {
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    ...meta.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Sumly" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta property="og:locale" content="${esc(meta.ogLocale)}" />`,
    `<meta property="og:image" content="${esc(meta.ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.ogImage)}" />`,
    `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
  ];
  return tags.join('\n    ');
}
