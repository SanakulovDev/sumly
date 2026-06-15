import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Reveals an element as it scrolls into view by adding the `is-visible` class.
 *
 * SSR-safe: the observer is wired up in an effect (client-only). Elements start
 * fully visible via CSS and are only hidden-then-revealed when JS is present, so
 * crawlers and no-JS users always see the content. Returns a ref to attach to
 * the target element.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback: if the browser can't observe, just show the element.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * Returns a ref and a boolean that flips to true the first time the element
 * enters the viewport. Used to trigger one-shot animations (count-up, charts)
 * only once they're actually seen. SSR-safe (starts false, no observer on server).
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.3,
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
