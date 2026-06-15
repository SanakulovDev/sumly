import { Link } from 'react-router-dom';
import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function ReceiptScan({ copy }: { copy: LandingCopy }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <Reveal>
        <div className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-600 to-teal-700 p-8 text-white shadow-glow md:grid-cols-2 md:p-14">
          {/* Decorative glow */}
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">
              {copy.receipt.badge}
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{copy.receipt.title}</h2>
            <p className="mt-4 max-w-md text-white/90">{copy.receipt.desc}</p>
            <Link
              to="/register"
              className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lifted transition hover:bg-brand-50"
            >
              {copy.receipt.cta} →
            </Link>
          </div>

          <div aria-hidden className="relative flex justify-center">
            <div className="relative w-52 overflow-hidden rounded-2xl bg-white p-5 text-slate-700 shadow-2xl">
              <div className="text-center text-xs font-bold tracking-widest text-slate-400">
                {copy.demo.scan.merchant.toUpperCase()}
              </div>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Non</span><span>8 000</span></div>
                <div className="flex justify-between"><span>Sut</span><span>12 000</span></div>
                <div className="flex justify-between"><span>Tuxum</span><span>18 000</span></div>
                <div className="mt-2 flex justify-between border-t border-dashed border-slate-300 pt-2 font-bold">
                  <span>{copy.demo.scan.totalLabel}</span><span>38 000</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-center text-xs font-semibold text-brand-700">
                ✓ {copy.demo.scan.done}
              </div>
              {/* Scan sweep — full-height overlay translated for a cheap GPU sweep */}
              <div className="pointer-events-none absolute inset-0 animate-scan">
                <div className="h-0.5 w-full bg-brand-500 shadow-[0_0_14px_3px_rgba(5,150,105,0.75)]" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
