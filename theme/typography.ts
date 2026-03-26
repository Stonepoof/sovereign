// ─── Typography Scale ──────────────────────────────────────────────────────
// Font sizes, weights, and line heights for Sovereign.
// Uses system fonts (no custom fonts needed for MVP).

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  default: 'System',
});

const monoFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  web: '"SF Mono", "Fira Code", monospace',
  default: 'monospace',
});

export const fontSize = {
  /** 10px */
  xxs: 10,
  /** 12px */
  xs: 12,
  /** 14px */
  sm: 14,
  /** 16px */
  md: 16,
  /** 18px */
  lg: 18,
  /** 20px */
  xl: 20,
  /** 24px */
  xxl: 24,
  /** 28px */
  xxxl: 28,
  /** 32px */
  title: 32,
  /** 40px */
  hero: 40,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

export const typography = {
  fontFamily,
  monoFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const;
