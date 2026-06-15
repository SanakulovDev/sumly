import { useEffect, useState } from 'react';

/** Formats an integer with thin spaces as thousands separators (so'm style). */
export function formatSom(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Animates a number from 0 up to `target` once `active` becomes true.
 *
 * Server render and the very first paint show the final value (good for no-JS
 * and to avoid a "0" flash on crawlers); on the client the count-up runs from 0.
 * Honors prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target: number, active: boolean, durationMs = 1100): number {
  const [value, setValue] = useState(() => (typeof window === 'undefined' ? target : 0));

  useEffect(() => {
    if (!active) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof requestAnimationFrame === 'undefined') {
      setValue(target);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic for a snappy settle.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);

  return value;
}
