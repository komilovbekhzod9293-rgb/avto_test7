import type { SVGProps } from 'react';

// Custom, hand-drawn monoline icon set — geometric, consistent 1.6 stroke,
// tuned for this brand (not generic app/phone icons).
type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

// Mnemonics — an idea/memory spark
export const IconMnemonic = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 17.5h6" />
    <path d="M10 20h4" />
    <path d="M12 3.5a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7h5.6c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3.5Z" />
    <path d="M12 8.5v3.5" />
  </Base>
);

// Competition — 1:1 duel
export const IconDuel = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6l5 6-5 6" />
    <path d="M20 6l-5 6 5 6" />
    <circle cx="12" cy="12" r="1.4" />
  </Base>
);

// Record time — stopwatch
export const IconStopwatch = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="13.5" r="6.5" />
    <path d="M12 13.5V10" />
    <path d="M10 3.5h4" />
    <path d="M12 3.5V7" />
    <path d="M18.5 7L20 5.5" />
  </Base>
);

// Final test — target
export const IconTarget = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </Base>
);

// Useful info — road sign (triangle)
export const IconSign = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4.2 20 18.5H4L12 4.2Z" />
    <path d="M12 10v4" />
    <path d="M12 16.4v.1" />
  </Base>
);

// Work on mistakes — retry loop
export const IconRetry = (p: IconProps) => (
  <Base {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.7 4.5V9h-4.5" />
  </Base>
);

// Step 1 — register (person +)
export const IconUserPlus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="10" cy="8" r="3.4" />
    <path d="M4 19.5c0-3.3 2.7-6 6-6h.5" />
    <path d="M17.5 13v6" />
    <path d="M14.5 16h6" />
  </Base>
);

// Step 2 — verify via chat
export const IconChatCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 15.5H9l-4 3.5V6a1.5 1.5 0 0 1 1.5-1.5h12A1.5 1.5 0 0 1 20 6v9.5Z" />
    <path d="M8.5 10l2.2 2.2L15 8" />
  </Base>
);

// Step 3 — start learning (cap)
export const IconCap = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 8.5 12 5l9.5 3.5L12 12 2.5 8.5Z" />
    <path d="M6 10.2v4.3c0 1.4 12 1.4 12 0v-4.3" />
    <path d="M21.5 8.5v5" />
  </Base>
);

// Location pin
export const IconPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21c4.8-5.2 7-8.3 7-11.5A7 7 0 0 0 5 9.5C5 12.7 7.2 15.8 12 21Z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </Base>
);
