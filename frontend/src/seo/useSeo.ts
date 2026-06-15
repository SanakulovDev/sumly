import { useEffect } from 'react';
import type { SeoMeta } from './landingMeta';

function upsert(selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  apply(el);
}

function meta(attr: 'name' | 'property', key: string, content: string) {
  upsert(
    `meta[${attr}="${key}"]`,
    () => {
      const m = document.createElement('meta');
      m.setAttribute(attr, key);
      return m;
    },
    (el) => el.setAttribute('content', content),
  );
}

// Applies SEO metadata to the live document for client-side navigation. The
// prerendered HTML already contains these tags; this keeps them correct when
// users navigate between languages in the SPA.
export function useSeo(m: SeoMeta) {
  useEffect(() => {
    document.documentElement.lang = m.htmlLang;
    document.title = m.title;
    meta('name', 'description', m.description);
    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', 'Sumly');
    meta('property', 'og:title', m.title);
    meta('property', 'og:description', m.description);
    meta('property', 'og:url', m.canonical);
    meta('property', 'og:locale', m.ogLocale);
    meta('property', 'og:image', m.ogImage);
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', m.title);
    meta('name', 'twitter:description', m.description);
    meta('name', 'twitter:image', m.ogImage);

    upsert(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link');
        l.rel = 'canonical';
        return l;
      },
      (el) => el.setAttribute('href', m.canonical),
    );
  }, [m]);
}
