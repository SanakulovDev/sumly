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
