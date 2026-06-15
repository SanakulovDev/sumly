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
          <Link
            to="/register"
            className="mt-6 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            {copy.receipt.cta} →
          </Link>
        </div>
        <div aria-hidden className="flex justify-center">
          <div className="w-48 rounded-xl bg-white p-4 text-slate-700 shadow-lifted">
            <div className="text-center text-xs font-semibold text-slate-400">RECEIPT</div>
            <div className="mt-2 space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Bread</span><span>8 000</span></div>
              <div className="flex justify-between"><span>Milk</span><span>12 000</span></div>
              <div className="flex justify-between"><span>Eggs</span><span>18 000</span></div>
              <div className="mt-2 flex justify-between border-t border-dashed border-slate-300 pt-2 font-bold">
                <span>Total</span><span>38 000</span>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-brand-50 py-1.5 text-center text-xs font-semibold text-brand-700">
              ✓ Read automatically
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
