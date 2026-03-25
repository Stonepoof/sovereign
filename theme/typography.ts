import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headers
  h1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  h2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.3,
  },
  h3: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // Body
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontFamily,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },

  // Caption
  caption: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 14,
  },

  // Stats
  stat: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  statLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },

  // Dice
  diceResult: {
    fontFamily,
    fontSize: 48,
    fontWeight: '800' as const,
    lineHeight: 56,
  },

  // Button
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
};

export type TypographyKey = keyof typeof typography;
