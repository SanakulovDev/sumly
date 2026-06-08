// Simple loading spinner used for page and inline loading states.
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

// Full-area centered spinner for page-level loading.
export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
