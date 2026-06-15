import type { CSSProperties, ReactNode } from 'react';
import { useReveal } from './useReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in milliseconds for sequenced reveals. */
  delay?: number;
}

/**
 * Wraps content in a scroll-reveal container. Applies the `reveal` class (hidden
 * until in view, only when JS is present) and an optional stagger delay.
 */
export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const ref = useReveal<HTMLDivElement>();
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;
  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
