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
