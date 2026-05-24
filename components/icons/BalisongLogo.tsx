import type { SVGProps } from 'react';

/** Minimal balisong silhouette — pivot at center, blade up-right, two handles
 *  fanning down. Stroke-based so it inherits color via currentColor. */
export function BalisongLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* handles fanned open */}
      <path d="M12 13 L4 19" />
      <path d="M12 13 L20 19" />
      {/* blade — filled triangle for visual weight */}
      <path d="M12 12.5 L20.5 4 L22 5.5 L13.5 14 Z" fill="currentColor" stroke="none" />
      {/* pivot */}
      <circle cx="12" cy="13" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
