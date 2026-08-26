"use client";

import { useId } from "react";

/**
 * Icon-only mark: three colored signal lines (cyan, teal, violet) converging
 * into a camera-lens ring — the WorkLens brand mark.
 */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const uid = useId();
  const cyanBlue = `cyanBlue-${uid}`;
  const tealBlue = `tealBlue-${uid}`;
  const violetBlue = `violetBlue-${uid}`;
  const lensRing = `lensRing-${uid}`;
  const lensCore = `lensCore-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={cyanBlue} x1="10" y1="14" x2="40" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2fc7f0" />
          <stop offset="100%" stopColor="#2f7ff0" />
        </linearGradient>
        <linearGradient id={tealBlue} x1="8" y1="32" x2="40" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1fd3ac" />
          <stop offset="100%" stopColor="#2f8ff0" />
        </linearGradient>
        <linearGradient id={violetBlue} x1="10" y1="50" x2="40" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b6ff5" />
          <stop offset="100%" stopColor="#2f7ff0" />
        </linearGradient>
        <linearGradient id={lensRing} x1="33" y1="21" x2="55" y2="43" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#39c6f7" />
          <stop offset="100%" stopColor="#2f6fef" />
        </linearGradient>
        <radialGradient id={lensCore} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#1c4f9c" />
          <stop offset="100%" stopColor="#0c2c58" />
        </radialGradient>
      </defs>

      <path d="M14 14 C 22 14, 26 20, 32.5 26" stroke={`url(#${cyanBlue})`} strokeWidth="4.25" strokeLinecap="round" />
      <circle cx="10" cy="14" r="4.5" fill="#2fc7f0" />

      <path d="M12.5 32 H 34" stroke={`url(#${tealBlue})`} strokeWidth="4.25" strokeLinecap="round" />
      <circle cx="8" cy="32" r="4.5" fill="#1fd3ac" />

      <path d="M14 50 C 22 50, 26 44, 32.5 38" stroke={`url(#${violetBlue})`} strokeWidth="4.25" strokeLinecap="round" />
      <circle cx="10" cy="50" r="4.5" fill="#8b6ff5" />

      <path d="M55 32 H 60" stroke="#2f9bef" strokeWidth="4.25" strokeLinecap="round" />

      <circle cx="44" cy="32" r="11" fill="none" stroke={`url(#${lensRing})`} strokeWidth="3.75" />
      <circle cx="44" cy="32" r="5.25" fill={`url(#${lensCore})`} />
    </svg>
  );
}

/**
 * Full lockup: icon mark + "WorkLens" wordmark, "Lens" rendered in the
 * brand gradient.
 */
export function Logo({
  size = 28,
  textClassName = "text-lg",
  className = "",
  dark = false,
}: {
  size?: number;
  textClassName?: string;
  className?: string;
  /** Use on dark backgrounds (e.g. the WorkLens landing page hero). */
  dark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      <span className={`font-semibold tracking-tight ${textClassName}`}>
        <span className={dark ? "text-white" : "text-ink"}>Work</span>
        <span className="text-gradient-brand">Lens</span>
      </span>
    </span>
  );
}
