// Minimal inline SVG icons (no icon-library dependency). Each accepts a
// className so size/color can be controlled via Tailwind.
type IconProps = { className?: string };

const base = (className?: string) =>
  `h-6 w-6 ${className ?? ''}`;

export function MicIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z" />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="13" y="7" width="3" height="10" rx="0.5" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function AutoThemeIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Renders a card-shaped SVG icon.
 *
 * @param className - Optional CSS class names added to the icon's root element
 * @returns An SVG element depicting a rounded-rectangle card with a horizontal divider near the top
 */
export function CardIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

/**
 * Renders an upward-pointing arrow icon as an inline SVG.
 *
 * @param className - Optional additional CSS classes appended to the base icon sizing/color classes
 * @returns A JSX element containing the SVG for an upward-pointing arrow
 */
export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

/**
 * Renders an SVG downward arrow icon sized for UI controls.
 *
 * @param className - Optional additional CSS classes appended to the icon's base sizing classes
 * @returns An SVG element depicting a downward-pointing arrow
 */
export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

/**
 * Renders a wallet-shaped SVG icon.
 *
 * @param className - Additional CSS class names (typically Tailwind) appended to the default `h-6 w-6` sizing classes
 * @returns The wallet icon SVG element
 */
export function WalletIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H5a2 2 0 0 1-2-2 2 2 0 0 1 2-2h13v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1" />
      <circle cx="16.5" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Renders a pencil (edit) icon as an inline SVG.
 *
 * @param className - Additional CSS classes applied to the SVG, typically used to control size and color
 * @returns The SVG element for a pencil icon
 */
export function PencilIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

/**
 * Renders a camera SVG icon.
 *
 * @param className - Additional CSS classes applied to the SVG element (typically Tailwind classes for size and color)
 * @returns The SVG element representing a camera icon
 */
export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

/**
 * Renders a trash (delete) icon as an inline SVG.
 *
 * @param className - Optional additional CSS classes to merge with the base `h-6 w-6` sizing and color classes
 * @returns A JSX element containing the trash icon SVG with the composed `className`
 */
export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={base(className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
