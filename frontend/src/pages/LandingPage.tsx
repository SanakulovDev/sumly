import { getLandingCopy, type LandingLang } from '../i18n/landing';
import { getLandingMeta } from '../seo/landingMeta';
import { useSeo } from '../seo/useSeo';
import { LandingHeader } from '../components/landing/LandingHeader';
import { Hero } from '../components/landing/Hero';
import { TrustStrip } from '../components/landing/TrustStrip';
import { ValueProps } from '../components/landing/ValueProps';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ReceiptScan } from '../components/landing/ReceiptScan';
import { Comparison } from '../components/landing/Comparison';
import { Languages } from '../components/landing/Languages';
import { FreeCallout } from '../components/landing/FreeCallout';
import { Faq } from '../components/landing/Faq';
import { FinalCTA } from '../components/landing/FinalCTA';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage({ lang }: { lang: LandingLang }) {
  const copy = getLandingCopy(lang);
  useSeo(getLandingMeta(lang));
  return (
    <div className="min-h-screen bg-white font-body text-slate-900 dark:bg-gray-950 dark:text-gray-100">
      <LandingHeader copy={copy} lang={lang} />
      <main>
        <Hero copy={copy} />
        <TrustStrip copy={copy} />
        <ValueProps copy={copy} />
        <Features copy={copy} />
        <HowItWorks copy={copy} />
        <ReceiptScan copy={copy} />
        <Comparison copy={copy} />
        <Languages copy={copy} />
        <FreeCallout copy={copy} />
        <Faq copy={copy} />
        <FinalCTA copy={copy} />
      </main>
      <LandingFooter copy={copy} />
    </div>
  );
}
