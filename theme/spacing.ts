// ─── Spacing Scale ─────────────────────────────────────────────────────────
// Consistent spacing values used across the app.

export const spacing = {
  /** 2px */
  xxs: 2,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 32px */
  xxxl: 32,
  /** 40px */
  huge: 40,
  /** 48px */
  massive: 48,
} as const;

export const borderRadius = {
  /** 4px */
  sm: 4,
  /** 8px */
  md: 8,
  /** 12px */
  lg: 12,
  /** 16px */
  xl: 16,
  /** 24px */
  xxl: 24,
  /** 9999px - pill shape */
  full: 9999,
} as const;

export const layout = {
  /** Max width for card content */
  cardMaxWidth: 380,
  /** Standard screen padding */
  screenPadding: spacing.lg,
  /** Meter bar height */
  meterBarHeight: 6,
  /** Meter bar height (expanded) */
  meterBarHeightExpanded: 10,
  /** Card swipe threshold in pixels */
  swipeThreshold: 80,
  /** Card rotation max degrees */
  cardRotationMax: 15,
} as const;
