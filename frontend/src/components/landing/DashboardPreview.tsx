interface DashboardPreviewProps {
  labels: { balance: string; today: string; month: string };
}

// Decorative, non-interactive dashboard mockup shown under the hero. aria-hidden
// because it duplicates information already stated in the hero copy.
export function DashboardPreview({ labels }: DashboardPreviewProps) {
  const rows: [string, string, string, string][] = [
    ['🍔', 'Food', 'Card ••4242', '-75 000'],
    ['💼', 'Sales', 'Cash', '+500 000'],
    ['🚕', 'Taxi', 'Cash', '-25 000'],
  ];
  return (
    <div aria-hidden className="mx-auto max-w-md">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lifted dark:border-gray-700 dark:bg-gray-800">
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white p-4 dark:from-gray-900 dark:to-gray-800">
          <p className="text-xs font-medium text-slate-500 dark:text-gray-400">{labels.balance}</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-700 dark:text-brand-300">1 250 000 so‘m</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {labels.today} +200 000
            </span>
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
              {labels.month} +900 000
            </span>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {rows.map(([emoji, name, method, amount]) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-gray-900/50"
            >
              <span className="flex items-center gap-2 text-slate-700 dark:text-gray-200">
                <span>{emoji}</span>
                {name}
              </span>
              <span className="text-xs text-slate-400">{method}</span>
              <span className={amount.startsWith('+') ? 'font-semibold text-brand-600' : 'font-semibold text-rose-500'}>
                {amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
