import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const SITE_URL = (process.env.VITE_SITE_URL ?? 'https://sumly.uz').replace(/\/$/, '');

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-landing.js')).href);

const targets = [
  { lang: 'en', path: '/', out: 'index.html' },
  { lang: 'ru', path: '/ru', out: 'ru/index.html' },
  { lang: 'uz', path: '/uz', out: 'uz/index.html' },
];

for (const t of targets) {
  const { html, head, htmlLang } = render(t.lang, t.path);
  let page = template
    .replace('<html lang="en">', `<html lang="${htmlLang}">`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  // Drop the static <title> from index.html so the injected one is the only title.
  page = page.replace(/<title>[\s\S]*?<\/title>/, '');
  page = page.replace('</head>', `    ${head}\n  </head>`);

  const outPath = resolve(dist, t.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, page, 'utf8');
  console.log(`prerendered ${t.out} (${html.length} bytes of markup)`);
}

// Sitemap
const urls = [`${SITE_URL}/`, `${SITE_URL}/ru`, `${SITE_URL}/uz`];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((u) => `  <url><loc>${u}</loc></url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap, 'utf8');
console.log('wrote sitemap.xml');
