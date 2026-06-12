import { useId } from 'react';

// The Sumly logomark: an emerald→teal gradient coin tile carrying a flowing
// "S" — money (so'm) in motion. Drawn inline so it scales crisply at any size
// with no asset request.

interface LogoProps {
  className?: string;
}

/**
 * Renders the Sumly logomark as an inline SVG, using a per-instance unique gradient id to avoid id collisions.
 *
 * @param className - Optional CSS class applied to the root `<svg>` element
 * @returns The SVG element for the Sumly logo
 */
export function Logo({ className }: LogoProps) {
  // Unique per instance: a shared gradient id breaks when the first instance
  // sits in a hidden container (e.g. the desktop sidebar on mobile).
  const gradientId = `sumly-tile-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-label="Sumly">
      <defs>
        <linearGradient id={gradientId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="0.55" stopColor="#0d9488" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
      </defs>

      {/* Coin tile */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill={`url(#${gradientId})`} />
      {/* Inner ring gives it a minted-coin depth */}
      <rect x="5.5" y="5.5" width="37" height="37" rx="11" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />

      {/* Flowing S — money in motion */}
      <path
        d="M31.5 15.5c-1.4-2.3-4.3-3.4-7.2-3.4-3.9 0-6.8 2.1-6.8 5.4 0 7 14 3.6 14 11 0 3.3-3 5.4-7.2 5.4-3.1 0-6-1.2-7.5-3.6"
        stroke="white"
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      {/* Rising accent — a coin climbing out of the flow */}
      <circle cx="35.5" cy="11.5" r="2.6" fill="white" fillOpacity="0.9" />
    </svg>
  );
}
