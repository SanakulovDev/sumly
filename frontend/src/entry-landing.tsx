import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { LandingPage } from './pages/LandingPage';
import { getLandingMeta } from './seo/landingMeta';
import { renderHeadTags } from './seo/headTags';
import type { LandingLang } from './i18n/landing';

// Renders one landing language to { html, head } for the prerender script.
// useSeo's useEffect does not run during renderToString, so head tags are built
// explicitly from the same metadata source.
export function render(lang: LandingLang, path: string): { html: string; head: string; htmlLang: string } {
  const meta = getLandingMeta(lang);
  const html = renderToString(
    <StaticRouter location={path}>
      <LandingPage lang={lang} />
    </StaticRouter>,
  );
  return { html, head: renderHeadTags(meta), htmlLang: meta.htmlLang };
}
