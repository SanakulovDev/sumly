import { SITE_URL } from '../config/site';
import type { LandingLang } from '../i18n/landing';

export interface SeoMeta {
  lang: LandingLang;
  htmlLang: string;
  title: string;
  description: string;
  canonical: string;
  ogLocale: string;
  alternates: { hreflang: string; href: string }[];
  ogImage: string;
  jsonLd: Record<string, unknown>;
}

const PATHS: Record<LandingLang, string> = { en: '/', ru: '/ru', uz: '/uz' };
const HTML_LANG: Record<LandingLang, string> = { en: 'en', ru: 'ru', uz: 'uz' };
const OG_LOCALE: Record<LandingLang, string> = { en: 'en_US', ru: 'ru_RU', uz: 'uz_UZ' };

const TITLE: Record<LandingLang, string> = {
  en: 'Sumly — Track income & expenses, free | Built for Uzbekistan',
  ru: 'Sumly — Учёт доходов и расходов бесплатно | Для Узбекистана',
  uz: 'Sumly — Daromad va xarajatlar hisobi, bepul | O‘zbekiston uchun',
};
const DESCRIPTION: Record<LandingLang, string> = {
  en: 'Sumly is a free, mobile-first money tracker for Uzbekistan. Record income and expenses in seconds, scan receipts with AI, see live reports and export to Excel — in Uzbek, Russian and English.',
  ru: 'Sumly — бесплатный учёт денег для Узбекистана. Записывайте доходы и расходы за секунды, сканируйте чеки с ИИ, смотрите отчёты вживую и экспортируйте в Excel — на узбекском, русском и английском.',
  uz: 'Sumly — O‘zbekiston uchun bepul pul hisobi. Daromad va xarajatlarni soniyalarda yozing, cheklarni AI bilan skanerlang, jonli hisobotlarni ko‘ring va Excelга eksport qiling — o‘zbek, rus va ingliz tillarida.',
};

export function getLandingMeta(lang: LandingLang): SeoMeta {
  const canonical = SITE_URL + PATHS[lang];
  const ogImage = SITE_URL + '/og-image.svg';
  return {
    lang,
    htmlLang: HTML_LANG[lang],
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    canonical,
    ogLocale: OG_LOCALE[lang],
    alternates: [
      { hreflang: 'en', href: SITE_URL + '/' },
      { hreflang: 'ru', href: SITE_URL + '/ru' },
      { hreflang: 'uz', href: SITE_URL + '/uz' },
      { hreflang: 'x-default', href: SITE_URL + '/' },
    ],
    ogImage,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Sumly',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web, iOS, Android',
      description: DESCRIPTION[lang],
      url: canonical,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' },
      inLanguage: ['en', 'ru', 'uz'],
    },
  };
}
