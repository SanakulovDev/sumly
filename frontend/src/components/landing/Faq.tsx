import { useState } from 'react';
import type { LandingCopy } from '../../i18n/landing';
import { Reveal } from './Reveal';

export function Faq({ copy }: { copy: LandingCopy }) {
  // First item open by default so the section reads as content, not empty rows.
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:py-24">
      <Reveal className="text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-50 sm:text-4xl">
          {copy.faq.title}
        </h2>
      </Reveal>

      <Reveal delay={100} className="mt-10 space-y-3">
        {copy.faq.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft dark:border-white/10 dark:bg-white/5"
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50/60 dark:hover:bg-white/[0.03]"
                >
                  <span className="font-semibold text-slate-900 dark:text-gray-100">{item.q}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 transition-transform duration-300 dark:bg-brand-500/20 dark:text-brand-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-slate-600 dark:text-gray-300">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
