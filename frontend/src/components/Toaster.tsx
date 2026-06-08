import { useToastStore } from '../store/toastStore';

// Renders the global toast queue in the top-right corner.
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex w-full max-w-xs flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`rounded-lg px-4 py-3 text-left text-sm font-medium text-white shadow-lg ${
            t.type === 'success' ? 'bg-brand-600' : 'bg-red-600'
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
