# Sumly Landing Page + SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, three-language (English-canonical, Russian, Uzbek) marketing landing page for Sumly that converts visitors to sign up and is fully indexable via build-time prerendered static HTML.

**Architecture:** A new public `LandingPage` renders at `/` (English), `/ru`, `/uz`. `/` shows the landing to guests and the dashboard to logged-in users (conditional route element — dashboard URL unchanged). Landing copy and SEO metadata live in pure data modules consumed by both a runtime `useSeo` hook and a build-time prerender step. Prerendering uses a Vite SSR build + `renderToString` (no headless browser), emitting `dist/index.html`, `dist/ru/index.html`, `dist/uz/index.html` with full content, `hreflang`, Open Graph, and JSON-LD.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind, react-router-dom v6, `react-dom/server`, Vite SSR build. No new runtime dependencies.

**Testing note:** The frontend has no unit-test runner and adding one is out of scope. Verification gates are: `npm run lint` (tsc typecheck) for code correctness, and a build + content-assertion script for the prerender/SEO output. These are concrete and runnable.

**Config note:** Canonical/hreflang/sitemap URLs use a single base URL. Default `https://sumly.uz`, overridable via `VITE_SITE_URL`. Update the default if the production domain differs.

---

## File Structure

**Create:**
- `frontend/src/config/site.ts` — `SITE_URL` constant.
- `frontend/src/i18n/landing.ts` — landing copy dictionaries (en/ru/uz) + `getLandingCopy(lang)` + `LandingLang` type.
- `frontend/src/seo/landingMeta.ts` — `getLandingMeta(lang)` pure metadata (title, description, canonical, alternates, og, jsonLd).
- `frontend/src/seo/headTags.ts` — `renderHeadTags(meta)` → HTML string for `<head>` (build-time).
- `frontend/src/seo/useSeo.ts` — runtime hook applying a meta object to `document`.
- `frontend/src/components/landing/DashboardPreview.tsx` — hero product mockup.
- `frontend/src/components/landing/LandingHeader.tsx`
- `frontend/src/components/landing/Hero.tsx`
- `frontend/src/components/landing/TrustStrip.tsx`
- `frontend/src/components/landing/Features.tsx`
- `frontend/src/components/landing/HowItWorks.tsx`
- `frontend/src/components/landing/ReceiptScan.tsx`
- `frontend/src/components/landing/Languages.tsx`
- `frontend/src/components/landing/FinalCTA.tsx`
- `frontend/src/components/landing/LandingFooter.tsx`
- `frontend/src/pages/LandingPage.tsx` — composes sections, takes `lang` prop, calls `useSeo`.
- `frontend/src/entry-landing.tsx` — SSR entry exporting `render(path)`.
- `frontend/scripts/prerender.mjs` — post-build prerender + sitemap generation.
- `frontend/public/robots.txt`
- `frontend/public/og-image.svg`

**Modify:**
- `frontend/src/App.tsx` — public landing routes + conditional `/`.
- `frontend/package.json` — `build` script chain.
- `frontend/nginx.conf` — cache headers (optional, low-risk).

---

## Task 1: Site config + landing copy dictionary

**Files:**
- Create: `frontend/src/config/site.ts`
- Create: `frontend/src/i18n/landing.ts`

- [ ] **Step 1: Create site config**

```ts
// frontend/src/config/site.ts
// Single source of truth for absolute URLs used in SEO metadata (canonical,
// hreflang, Open Graph, sitemap). Override at build time with VITE_SITE_URL.
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://sumly.uz').replace(/\/$/, '');
```

- [ ] **Step 2: Create the landing copy dictionary**

English is authored as the source of truth; RU/UZ mirror it. Keep keys flat per section.

```ts
// frontend/src/i18n/landing.ts
export type LandingLang = 'en' | 'ru' | 'uz';

export interface LandingCopy {
  nav: { features: string; how: string; languages: string; login: string; signup: string };
  hero: { badge: string; titleA: string; titleAccent: string; titleB: string; subtitle: string; cta: string; secondary: string };
  trust: string[];
  featuresTitle: string;
  featuresSubtitle: string;
  features: { title: string; desc: string }[];
  howTitle: string;
  how: { title: string; desc: string }[];
  receipt: { badge: string; title: string; desc: string; cta: string };
  langs: { title: string; desc: string };
  finalCta: { title: string; subtitle: string; cta: string };
  footer: { tagline: string; rights: string };
}

const en: LandingCopy = {
  nav: { features: 'Features', how: 'How it works', languages: 'Languages', login: 'Log in', signup: 'Sign up' },
  hero: {
    badge: '💰 Money, made simple',
    titleA: 'Know exactly where your ',
    titleAccent: 'money',
    titleB: ' goes.',
    subtitle: 'Record income and expenses in seconds. Built for Uzbekistan — mobile-first, in your language, free.',
    cta: 'Get started free',
    secondary: 'Log in',
  },
  trust: ['Free to use', '3 languages', 'Works on any phone', 'Export to Excel'],
  featuresTitle: 'Everything you need to track your money',
  featuresSubtitle: 'Simple enough for daily use, powerful enough to see the full picture.',
  features: [
    { title: 'Fast entry', desc: 'Add an income or expense in seconds — one tap from anywhere.' },
    { title: 'Receipt scan', desc: 'Snap a receipt photo and let AI read the amount for you.' },
    { title: 'Cash or card', desc: 'Mark a method as a card and capture the last 4 digits automatically.' },
    { title: 'Live dashboard', desc: 'See your balance plus today’s and this month’s income, expense and profit.' },
    { title: 'Filters & reports', desc: 'Filter by type, category, method and date; daily and monthly breakdowns.' },
    { title: 'Excel export', desc: 'Download filtered transactions or a full monthly workbook as a real .xlsx file.' },
  ],
  howTitle: 'Start in three steps',
  how: [
    { title: 'Create your account', desc: 'Sign up free — default categories and payment methods are ready instantly.' },
    { title: 'Add a transaction', desc: 'Record income or an expense, by cash or card, in a few taps.' },
    { title: 'See your money clearly', desc: 'Watch your balance and reports update live, and export anytime.' },
  ],
  receipt: {
    badge: 'AI receipt scan',
    title: 'Snap a receipt. We’ll do the typing.',
    desc: 'Take a photo of any receipt and Sumly reads the amount and details, so you just review and save. No more manual entry.',
    cta: 'Try it free',
  },
  langs: {
    title: 'In your language, for your market',
    desc: 'Switch instantly between O‘zbekcha, Русский and English. Amounts in so‘m, built for how Uzbekistan tracks money.',
  },
  finalCta: { title: 'Start tracking every so‘m — free.', subtitle: 'Join Sumly and take control of your money today.', cta: 'Get started free' },
  footer: { tagline: 'Track every so‘m.', rights: 'All rights reserved.' },
};

const ru: LandingCopy = {
  nav: { features: 'Возможности', how: 'Как это работает', languages: 'Языки', login: 'Войти', signup: 'Регистрация' },
  hero: {
    badge: '💰 Деньги — это просто',
    titleA: 'Точно знайте, куда уходят ваши ',
    titleAccent: 'деньги',
    titleB: '.',
    subtitle: 'Записывайте доходы и расходы за секунды. Создано для Узбекистана — удобно на телефоне, на вашем языке, бесплатно.',
    cta: 'Начать бесплатно',
    secondary: 'Войти',
  },
  trust: ['Бесплатно', '3 языка', 'Работает на любом телефоне', 'Экспорт в Excel'],
  featuresTitle: 'Всё, что нужно для учёта денег',
  featuresSubtitle: 'Достаточно просто для каждого дня и достаточно мощно, чтобы видеть полную картину.',
  features: [
    { title: 'Быстрый ввод', desc: 'Добавьте доход или расход за секунды — одним касанием из любого места.' },
    { title: 'Сканирование чека', desc: 'Сфотографируйте чек, и ИИ сам прочитает сумму.' },
    { title: 'Наличные или карта', desc: 'Отметьте способ как карту и автоматически сохраните последние 4 цифры.' },
    { title: 'Живая панель', desc: 'Баланс, а также доход, расход и прибыль за сегодня и за месяц.' },
    { title: 'Фильтры и отчёты', desc: 'Фильтр по типу, категории, способу и дате; разбивка по дням и месяцам.' },
    { title: 'Экспорт в Excel', desc: 'Скачайте отфильтрованные операции или месячную книгу в реальном .xlsx.' },
  ],
  howTitle: 'Начните за три шага',
  how: [
    { title: 'Создайте аккаунт', desc: 'Регистрация бесплатна — категории и способы оплаты готовы сразу.' },
    { title: 'Добавьте операцию', desc: 'Запишите доход или расход, наличными или картой, в пару касаний.' },
    { title: 'Видьте деньги ясно', desc: 'Баланс и отчёты обновляются вживую, экспорт в любой момент.' },
  ],
  receipt: {
    badge: 'ИИ-сканирование чеков',
    title: 'Сфотографируйте чек. Печатать будем мы.',
    desc: 'Сделайте фото любого чека — Sumly прочитает сумму и детали, вам остаётся проверить и сохранить. Больше никакого ручного ввода.',
    cta: 'Попробовать бесплатно',
  },
  langs: {
    title: 'На вашем языке, для вашего рынка',
    desc: 'Мгновенно переключайтесь между O‘zbekcha, Русским и English. Суммы в сумах, как принято в Узбекистане.',
  },
  finalCta: { title: 'Считайте каждый сум — бесплатно.', subtitle: 'Присоединяйтесь к Sumly и возьмите деньги под контроль уже сегодня.', cta: 'Начать бесплатно' },
  footer: { tagline: 'Считайте каждый сум.', rights: 'Все права защищены.' },
};

const uz: LandingCopy = {
  nav: { features: 'Imkoniyatlar', how: 'Qanday ishlaydi', languages: 'Tillar', login: 'Kirish', signup: 'Ro‘yxatdan o‘tish' },
  hero: {
    badge: '💰 Pulni boshqarish oson',
    titleA: 'Pulingiz qayerga ketayotganini aniq ',
    titleAccent: 'biling',
    titleB: '.',
    subtitle: 'Daromad va xarajatlarni soniyalarda yozing. O‘zbekiston uchun — telefonga qulay, o‘z tilingizda, bepul.',
    cta: 'Bepul boshlash',
    secondary: 'Kirish',
  },
  trust: ['Bepul', '3 til', 'Har qanday telefonda', 'Excelга eksport'],
  featuresTitle: 'Pulingizni nazorat qilish uchun hammasi',
  featuresSubtitle: 'Har kuni ishlatishga yetarlicha sodda, to‘liq manzarani ko‘rishga yetarlicha kuchli.',
  features: [
    { title: 'Tez kiritish', desc: 'Daromad yoki xarajatni soniyalarda qo‘shing — istalgan joydan bir tegishda.' },
    { title: 'Chek skani', desc: 'Chek suratini oling, summani sun’iy intellekt o‘zi o‘qiydi.' },
    { title: 'Naqd yoki karta', desc: 'Usulni karta deb belgilang va oxirgi 4 raqamni avtomatik saqlang.' },
    { title: 'Jonli panel', desc: 'Balans hamda bugungi va shu oylik daromad, xarajat va foyda.' },
    { title: 'Filtr va hisobotlar', desc: 'Turi, toifa, usul va sana bo‘yicha filtr; kunlik va oylik tahlil.' },
    { title: 'Excelга eksport', desc: 'Filtrlangan amallarni yoki oylik kitobni haqiqiy .xlsx sifatida yuklab oling.' },
  ],
  howTitle: 'Uch qadamda boshlang',
  how: [
    { title: 'Hisob yarating', desc: 'Ro‘yxatdan o‘tish bepul — toifalar va to‘lov usullari darhol tayyor.' },
    { title: 'Amal qo‘shing', desc: 'Daromad yoki xarajatni naqd yoki karta orqali bir necha tegishda yozing.' },
    { title: 'Pulni aniq ko‘ring', desc: 'Balans va hisobotlar jonli yangilanadi, istalgan vaqtda eksport qiling.' },
  ],
  receipt: {
    badge: 'AI chek skani',
    title: 'Chekni suratga oling. Yozishni biz qilamiz.',
    desc: 'Istalgan chek suratini oling — Sumly summa va tafsilotlarni o‘qiydi, siz faqat tekshirib saqlaysiz. Endi qo‘lda kiritish yo‘q.',
    cta: 'Bepul sinab ko‘ring',
  },
  langs: {
    title: 'O‘z tilingizda, o‘z bozoringiz uchun',
    desc: 'O‘zbekcha, Русский va English o‘rtasida bir zumda almashing. Summalar so‘mda, O‘zbekiston uchun moslangan.',
  },
  finalCta: { title: 'Har so‘mni hisoblang — bepul.', subtitle: 'Sumly’ga qo‘shiling va bugun pulingizni nazoratga oling.', cta: 'Bepul boshlash' },
  footer: { tagline: 'Har so‘mni hisobla.', rights: 'Barcha huquqlar himoyalangan.' },
};

const copies: Record<LandingLang, LandingCopy> = { en, ru, uz };

export function getLandingCopy(lang: LandingLang): LandingCopy {
  return copies[lang];
}
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npm run lint`
Expected: PASS (no type errors).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/config/site.ts frontend/src/i18n/landing.ts
git commit -m "feat(landing): add site config and 3-language landing copy"
```

---

## Task 2: SEO metadata + head tags + runtime hook

**Files:**
- Create: `frontend/src/seo/landingMeta.ts`
- Create: `frontend/src/seo/headTags.ts`
- Create: `frontend/src/seo/useSeo.ts`

- [ ] **Step 1: Metadata module (single source of truth)**

```ts
// frontend/src/seo/landingMeta.ts
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
```

- [ ] **Step 2: Head-tags renderer (build-time HTML string)**

```ts
// frontend/src/seo/headTags.ts
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
```

- [ ] **Step 3: Runtime hook (applies the same meta to document)**

```ts
// frontend/src/seo/useSeo.ts
import { useEffect } from 'react';
import type { SeoMeta } from './landingMeta';

function upsert(selector: string, create: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) { el = create(); document.head.appendChild(el); }
  apply(el);
}

function meta(attr: 'name' | 'property', key: string, content: string) {
  upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement('meta'); m.setAttribute(attr, key); return m;
  }, (el) => el.setAttribute('content', content));
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

    upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link'); l.rel = 'canonical'; return l;
    }, (el) => el.setAttribute('href', m.canonical));
  }, [m]);
}
```

- [ ] **Step 4: Typecheck**

Run: `cd frontend && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/seo
git commit -m "feat(landing): add SEO metadata, head-tag renderer and useSeo hook"
```

---

## Task 3: DashboardPreview mockup component

**Files:**
- Create: `frontend/src/components/landing/DashboardPreview.tsx`

- [ ] **Step 1: Implement the hero product mockup**

A self-contained, presentational mockup of the dashboard (no data). Uses brand classes; dark-mode aware. Static localized labels are passed by the parent via props to keep copy centralized — here we accept a small `labels` prop.

```tsx
// frontend/src/components/landing/DashboardPreview.tsx
interface DashboardPreviewProps {
  labels: { balance: string; today: string; month: string };
}

// Decorative, non-interactive dashboard mockup shown under the hero. aria-hidden
// because it duplicates information already stated in the hero copy.
export function DashboardPreview({ labels }: DashboardPreviewProps) {
  return (
    <div aria-hidden className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lifted dark:border-gray-700 dark:bg-gray-800">
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{labels.balance}</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-700 dark:text-brand-300">1 250 000 so‘m</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{labels.today} +200 000</span>
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{labels.month} +900 000</span>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {[['🍔', 'Food', 'Card ••4242', '-75 000'], ['💼', 'Sales', 'Cash', '+500 000'], ['🚕', 'Taxi', 'Cash', '-25 000']].map(
            ([emoji, name, method, amount]) => (
              <li key={name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-gray-900/50">
                <span className="flex items-center gap-2 text-slate-700 dark:text-gray-200"><span>{emoji}</span>{name}</span>
                <span className="text-xs text-slate-400">{method}</span>
                <span className={amount.startsWith('+') ? 'font-semibold text-brand-600' : 'font-semibold text-rose-500'}>{amount}</span>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && npm run lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/landing/DashboardPreview.tsx
git commit -m "feat(landing): add dashboard preview mockup"
```

---

## Task 4: Landing section components

**Files:**
- Create: `frontend/src/components/landing/LandingHeader.tsx`, `Hero.tsx`, `TrustStrip.tsx`, `Features.tsx`, `HowItWorks.tsx`, `ReceiptScan.tsx`, `Languages.tsx`, `FinalCTA.tsx`, `LandingFooter.tsx`

All section components take `copy: LandingCopy` (and `lang` where they render language links). They use react-router `Link` for `/register`, `/login`, and language URLs (`/`, `/ru`, `/uz`), and reuse `btn-primary`/`btn-secondary`/`card` classes and `Logo`.

- [ ] **Step 1: Header (sticky, with language switch + auth CTAs)**

```tsx
// frontend/src/components/landing/LandingHeader.tsx
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import type { LandingCopy, LandingLang } from '../../i18n/landing';

const LANG_LINKS: { lang: LandingLang; label: string; href: string }[] = [
  { lang: 'en', label: 'EN', href: '/' },
  { lang: 'ru', label: 'RU', href: '/ru' },
  { lang: 'uz', label: 'UZ', href: '/uz' },
];

export function LandingHeader({ copy, lang }: { copy: LandingCopy; lang: LandingLang }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to={lang === 'en' ? '/' : `/${lang}`} className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-gray-100">Sumly</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-gray-300 md:flex">
          <a href="#features" className="hover:text-brand-700">{copy.nav.features}</a>
          <a href="#how" className="hover:text-brand-700">{copy.nav.how}</a>
          <a href="#languages" className="hover:text-brand-700">{copy.nav.languages}</a>
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 p-0.5 dark:border-gray-700 sm:flex">
            {LANG_LINKS.map((l) => (
              <Link key={l.lang} to={l.href}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${l.lang === lang ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-brand-700'}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <Link to="/login" className="btn-secondary hidden sm:inline-flex">{copy.nav.login}</Link>
          <Link to="/register" className="btn-primary">{copy.nav.signup}</Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Hero (centered, emerald gradient + DashboardPreview)**

```tsx
// frontend/src/components/landing/Hero.tsx
import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { DashboardPreview } from './DashboardPreview';

export function Hero({ copy }: { copy: LandingCopy }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">{copy.hero.badge}</span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-gray-50 sm:text-5xl">
          {copy.hero.titleA}<span className="text-brand-600">{copy.hero.titleAccent}</span>{copy.hero.titleB}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-600 dark:text-gray-300 sm:text-lg">{copy.hero.subtitle}</p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">{copy.hero.cta} →</Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">{copy.hero.secondary}</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <DashboardPreview labels={{ balance: copy.featuresTitle && 'Total balance', today: 'Today', month: 'Month' }} />
      </div>
    </section>
  );
}
```

Note: pass real localized labels — replace the inline literals with `copy`-driven values. Add `previewLabels: { balance; today; month }` to `LandingCopy` in Task 1 if you want them localized; for the first pass English labels in the mockup are acceptable since it is `aria-hidden` decoration. **Decision for this plan: keep mockup labels in English (decorative, aria-hidden).** Replace the `labels` line with:

```tsx
        <DashboardPreview labels={{ balance: 'Total balance', today: 'Today', month: 'Month' }} />
```

- [ ] **Step 3: TrustStrip**

```tsx
// frontend/src/components/landing/TrustStrip.tsx
import type { LandingCopy } from '../../i18n/landing';

export function TrustStrip({ copy }: { copy: LandingCopy }) {
  return (
    <div className="border-y border-slate-200/70 bg-white dark:border-gray-800 dark:bg-gray-900">
      <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm font-medium text-slate-500 dark:text-gray-400">
        {copy.trust.map((t) => (<li key={t} className="flex items-center gap-2"><span className="text-brand-600">✓</span>{t}</li>))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Features grid**

```tsx
// frontend/src/components/landing/Features.tsx
import type { LandingCopy } from '../../i18n/landing';

const EMOJIS = ['⚡', '📷', '💳', '📊', '🔍', '📁'];

export function Features({ copy }: { copy: LandingCopy }) {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-50">{copy.featuresTitle}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-gray-300">{copy.featuresSubtitle}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {copy.features.map((f, i) => (
          <div key={f.title} className="card">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl dark:bg-brand-900/40">{EMOJIS[i]}</div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-gray-100">{f.title}</h3>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: HowItWorks**

```tsx
// frontend/src/components/landing/HowItWorks.tsx
import type { LandingCopy } from '../../i18n/landing';

export function HowItWorks({ copy }: { copy: LandingCopy }) {
  return (
    <section id="how" className="bg-slate-50 dark:bg-gray-800/40">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-50">{copy.howTitle}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {copy.how.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl bg-white p-6 shadow-soft dark:bg-gray-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-gray-100">{s.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: ReceiptScan highlight**

```tsx
// frontend/src/components/landing/ReceiptScan.tsx
import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';

export function ReceiptScan({ copy }: { copy: LandingCopy }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid items-center gap-10 rounded-3xl bg-gradient-to-br from-brand-600 to-teal-700 p-8 text-white md:grid-cols-2 md:p-12">
        <div>
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{copy.receipt.badge}</span>
          <h2 className="mt-4 text-3xl font-bold leading-tight">{copy.receipt.title}</h2>
          <p className="mt-3 text-white/90">{copy.receipt.desc}</p>
          <Link to="/register" className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">{copy.receipt.cta} →</Link>
        </div>
        <div aria-hidden className="flex justify-center">
          <div className="w-48 rounded-xl bg-white p-4 text-slate-700 shadow-lifted">
            <div className="text-center text-xs font-semibold text-slate-400">RECEIPT</div>
            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Bread</span><span>8 000</span></div>
              <div className="flex justify-between"><span>Milk</span><span>12 000</span></div>
              <div className="flex justify-between"><span>Eggs</span><span>18 000</span></div>
              <div className="mt-2 flex justify-between border-t border-dashed border-slate-300 pt-2 font-bold"><span>Total</span><span>38 000</span></div>
            </div>
            <div className="mt-3 rounded-lg bg-brand-50 py-1.5 text-center text-xs font-semibold text-brand-700">✓ Read automatically</div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Languages**

```tsx
// frontend/src/components/landing/Languages.tsx
import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';

export function Languages({ copy }: { copy: LandingCopy }) {
  return (
    <section id="languages" className="bg-slate-50 dark:bg-gray-800/40">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-50">{copy.langs.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-gray-300">{copy.langs.desc}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="chip">🇬🇧 English</Link>
          <Link to="/ru" className="chip">🇷🇺 Русский</Link>
          <Link to="/uz" className="chip">🇺🇿 O‘zbekcha</Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: FinalCTA**

```tsx
// frontend/src/components/landing/FinalCTA.tsx
import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';

export function FinalCTA({ copy }: { copy: LandingCopy }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">{copy.finalCta.title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-gray-300">{copy.finalCta.subtitle}</p>
      <Link to="/register" className="btn-primary mt-7 px-7 py-3 text-base">{copy.finalCta.cta} →</Link>
    </section>
  );
}
```

- [ ] **Step 9: Footer**

```tsx
// frontend/src/components/landing/LandingFooter.tsx
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import type { LandingCopy } from '../../i18n/landing';

export function LandingFooter({ copy }: { copy: LandingCopy }) {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="font-bold text-slate-900 dark:text-gray-100">Sumly</span>
          <span className="text-sm text-slate-500 dark:text-gray-400">— {copy.footer.tagline}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-gray-400">
          <Link to="/" className="hover:text-brand-700">EN</Link>
          <Link to="/ru" className="hover:text-brand-700">RU</Link>
          <Link to="/uz" className="hover:text-brand-700">UZ</Link>
          <Link to="/login" className="hover:text-brand-700">{copy.nav.login}</Link>
          <Link to="/register" className="hover:text-brand-700">{copy.nav.signup}</Link>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-slate-400">© {new Date().getFullYear()} Sumly. {copy.footer.rights}</p>
    </footer>
  );
}
```

- [ ] **Step 10: Typecheck + commit**

Run: `cd frontend && npm run lint`
Expected: PASS.

```bash
git add frontend/src/components/landing
git commit -m "feat(landing): add landing section components"
```

---

## Task 5: LandingPage + routing

**Files:**
- Create: `frontend/src/pages/LandingPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: LandingPage**

```tsx
// frontend/src/pages/LandingPage.tsx
import { getLandingCopy, type LandingLang } from '../i18n/landing';
import { getLandingMeta } from '../seo/landingMeta';
import { useSeo } from '../seo/useSeo';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ReceiptScan } from '../components/landing/ReceiptScan';
import { Languages } from '../components/landing/Languages';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage({ lang }: { lang: LandingLang }) {
  const copy = getLandingCopy(lang);
  useSeo(getLandingMeta(lang));
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingHeader copy={copy} lang={lang} />
      <main>
        <Hero copy={copy} />
        <TrustStrip copy={copy} />
        <Features copy={copy} />
        <HowItWorks copy={copy} />
        <ReceiptScan copy={copy} />
        <Languages copy={copy} />
        <FinalCTA copy={copy} />
      </main>
      <LandingFooter copy={copy} />
    </div>
  );
}
```

- [ ] **Step 2: Wire routes in App.tsx**

Make `/` conditional on auth (guest → landing, user → dashboard) without moving the dashboard URL. Add `/ru` and `/uz` as always-landing public routes. Import `LandingPage`, `useAuthStore` already imported, and `PageLoader`.

Replace the `<Routes>` block and add imports:

```tsx
import { LandingPage } from './pages/LandingPage';
import { PageLoader } from './components/Spinner';
// ...existing imports unchanged...

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => { void bootstrap(); }, [bootstrap]);

  // Element for "/": loader while restoring session, dashboard shell for
  // authenticated users, marketing landing for guests.
  const rootElement = initializing ? <PageLoader /> : user ? <Layout /> : <LandingPage lang="en" />;

  return (
    <>
      <Toaster />
      <Routes>
        {/* Root: landing for guests, app shell for users */}
        <Route path="/" element={rootElement}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* Public landing — Russian / Uzbek */}
        <Route path="/ru" element={<LandingPage lang="ru" />} />
        <Route path="/uz" element={<LandingPage lang="uz" />} />

        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes share the app Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<TransactionFormPage />} />
            <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/payment-methods" element={<PaymentMethodsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
```

Notes:
- When guest: `rootElement` is `<LandingPage/>` which renders no `<Outlet/>`, so the nested `index` `<DashboardPage/>` is simply not displayed.
- When user: `rootElement` is `<Layout/>` (renders `<Outlet/>`), so `index` renders `<DashboardPage/>` at `/` exactly as before. Layout nav `to="/"` and login/register redirects to `/` keep working.

- [ ] **Step 3: Typecheck**

Run: `cd frontend && npm run lint`
Expected: PASS.

- [ ] **Step 4: Manual dev check**

Run: `cd frontend && npm run dev`, open `http://localhost:5173/` (guest) → landing renders; `/ru`, `/uz` → translated; logging in → `/` shows dashboard. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/LandingPage.tsx frontend/src/App.tsx
git commit -m "feat(landing): add LandingPage and public landing routes"
```

---

## Task 6: Static SEO assets (robots, og-image)

**Files:**
- Create: `frontend/public/robots.txt`
- Create: `frontend/public/og-image.svg`

- [ ] **Step 1: robots.txt**

```text
User-agent: *
Allow: /

Sitemap: https://sumly.uz/sitemap.xml
```

(If `VITE_SITE_URL` differs, update the Sitemap line to match.)

- [ ] **Step 2: og-image.svg (branded 1200×630 placeholder)**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#10b981"/><stop offset="0.55" stop-color="#0d9488"/><stop offset="1" stop-color="#0e7490"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#064e3b"/>
  <rect x="80" y="80" width="1040" height="470" rx="32" fill="url(#g)"/>
  <text x="600" y="300" text-anchor="middle" font-family="system-ui, sans-serif" font-size="120" font-weight="800" fill="#ffffff">Sumly</text>
  <text x="600" y="380" text-anchor="middle" font-family="system-ui, sans-serif" font-size="44" fill="#ecfdf5">Track every so‘m — free.</text>
</svg>
```

> **Note:** Some social platforms (Facebook, X) do not render SVG OG images. For full preview support, export this to a 1200×630 PNG at `public/og-image.png` and switch `ogImage` in `landingMeta.ts` to `/og-image.png`. SVG is the committed first pass.

- [ ] **Step 3: Commit**

```bash
git add frontend/public/robots.txt frontend/public/og-image.svg
git commit -m "feat(landing): add robots.txt and og-image"
```

---

## Task 7: Prerender — SSR entry + build script + pipeline

**Files:**
- Create: `frontend/src/entry-landing.tsx`
- Create: `frontend/scripts/prerender.mjs`
- Modify: `frontend/package.json`

- [ ] **Step 1: SSR entry**

```tsx
// frontend/src/entry-landing.tsx
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
```

- [ ] **Step 2: Prerender script**

```js
// frontend/scripts/prerender.mjs
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
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    .replace('</head>', `    ${head}\n  </head>`);
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
```

Note: the template currently strips/keeps the existing `<title>` from `index.html`. The injected `head` adds a new `<title>`; the original `<title>Sumly — …</title>` in `index.html` remains. To avoid two titles, also remove the original: add this replace before injecting head:

```js
  page = page.replace(/<title>[\s\S]*?<\/title>/, '');
```

Place that line right after building `page` (after the three `.replace` calls, before `writeFileSync`).

- [ ] **Step 3: Update build pipeline in package.json**

Change the `build` script to: client build → SSR build → prerender. The SSR build needs `react-dom/server`-compatible output.

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build && vite build --ssr src/entry-landing.tsx --outDir dist-ssr && node scripts/prerender.mjs",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  }
}
```

- [ ] **Step 4: Add dist-ssr to .dockerignore/.gitignore if needed**

Check `frontend/.gitignore` includes `dist` (it should). Add `dist-ssr` next to it.

Run: `grep -n "dist" frontend/.gitignore`
If `dist-ssr` is absent, append it:

```bash
printf 'dist-ssr\n' >> frontend/.gitignore
```

- [ ] **Step 5: Build and verify prerender output**

Run: `cd frontend && npm run build`
Expected: completes; logs `prerendered index.html`, `ru/index.html`, `uz/index.html`, `wrote sitemap.xml`.

- [ ] **Step 6: Assert real content is in the HTML**

Run:
```bash
cd frontend
grep -q "Know exactly where your" dist/index.html && echo "EN ok"
grep -q "Точно знайте, куда уходят" dist/ru/index.html && echo "RU ok"
grep -q "Pulingiz qayerga ketayotganini" dist/uz/index.html && echo "UZ ok"
grep -q 'hreflang="x-default"' dist/index.html && echo "hreflang ok"
grep -q 'application/ld+json' dist/index.html && echo "jsonld ok"
grep -q '<html lang="ru">' dist/ru/index.html && echo "ru lang ok"
```
Expected: all six "ok" lines print.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/entry-landing.tsx frontend/scripts/prerender.mjs frontend/package.json frontend/.gitignore
git commit -m "feat(landing): prerender landing to static HTML per language + sitemap"
```

---

## Task 8: nginx cache headers (low-risk hardening)

**Files:**
- Modify: `frontend/nginx.conf`

The existing `try_files $uri $uri/ /index.html` already serves `/ru/` and `/uz/` directories and falls back to the SPA. This task only adds cache-control so prerendered HTML is revalidated while hashed assets cache long.

- [ ] **Step 1: Add cache rules inside the `server` block (before `location /`)**

```nginx
    # Long-cache fingerprinted build assets.
    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Always revalidate HTML so prerendered pages update on deploy.
    location ~* \.html$ {
        add_header Cache-Control "no-cache";
    }
```

- [ ] **Step 2: Commit**

```bash
git add frontend/nginx.conf
git commit -m "chore(nginx): cache assets long, revalidate HTML"
```

---

## Task 9: Final verification

- [ ] **Step 1: Full typecheck + build**

Run: `cd frontend && npm run lint && npm run build`
Expected: both PASS; prerender logs appear.

- [ ] **Step 2: Serve the build and spot-check**

Run: `cd frontend && npm run preview` then open `http://localhost:4173/`, `/ru`, `/uz`.
Expected: landing renders in all three languages; nav language pills switch URLs; Sign up → `/register`; Log in → `/login`.

- [ ] **Step 3: View-source check (crawler perspective)**

In the browser, View Source on `/` (preview). Confirm the hero headline text and `<title>`/`hreflang`/JSON-LD are present in the raw HTML (not just after JS runs).

- [ ] **Step 4: Confirm no regressions in the app**

Log in; confirm `/` shows the dashboard and all existing routes (`/transactions`, `/reports`, `/settings`, etc.) work.

- [ ] **Step 5: Docker build sanity (optional but recommended)**

Run: `docker compose build frontend`
Expected: build succeeds (prerender runs inside the Node build stage; no Chromium/native deps required).

---

## Self-Review Summary

- **Spec coverage:** SEO (Task 2, 6, 7), prerender static HTML per language (Task 7), sign-up CTA (Tasks 4–5), root routing guest/user (Task 5), language path prefixes + hreflang + x-default (Tasks 2, 7), English canonical default (Task 5 `/` → en), centered bold hero (Task 4 Hero + Task 3 preview), all 9 sections (Tasks 3–5), JSON-LD + OG + sitemap + robots (Tasks 2, 6, 7), nginx (Task 8), verification (Task 9). All covered.
- **Tooling decision:** Vite SSR + `renderToString` (no headless browser), satisfying the spec's "lightest reliable option" with no native/Chromium deps — Docker-safe.
- **Type consistency:** `LandingCopy`, `LandingLang`, `SeoMeta`, `getLandingCopy`, `getLandingMeta`, `renderHeadTags`, `useSeo`, `render(lang, path)` used consistently across tasks.
