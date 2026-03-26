// Sovereign color palette
// ─── Color Palette ─────────────────────────────────────────────────────────
// Dark-first palette for Sovereign. Gold accent, dark backgrounds.

export const colors = {
  // Core backgrounds
  background: '#0a0a1a',
  surface: '#1a1a2e',
  surfaceLight: '#2a2a3e',
  surfaceBorder: '#3a3a4e',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#b0b0c0',
  textMuted: '#6a6a7a',
  textDisabled: '#4a4a5a',

  // Accent
  gold: '#ffd700',
  goldDim: '#b8960f',
  goldMuted: '#8a7210',

  // Meters
  meter: {
    authority: '#dc3545',
    populace: '#4a9eff',
    treasury: '#f0ad4e',
    military: '#28a745',
    stability: '#8b5cf6',
  },

  // Meter zone backgrounds (for meter bar fill)
  meterZone: {
    critical: '#dc354520',
    warning: '#f0ad4e20',
    healthy: '#28a74520',
    excessive: '#8b5cf620',
  },

  // Agency types (9 types)
  agency: {
    decree: '#dc3545',
    diplomacy: '#4a9eff',
    commerce: '#f0ad4e',
    military: '#28a745',
    espionage: '#8b5cf6',
    faith: '#e879f9',
    infrastructure: '#06b6d4',
    culture: '#f97316',
    justice: '#64748b',
  },

  // Swipe direction indicators
  swipe: {
    left: '#dc3545',
    right: '#28a745',
    up: '#4a9eff',
    down: '#f0ad4e',
  },

  // Status colors
  success: '#28a745',
  warning: '#f0ad4e',
  danger: '#dc3545',
  info: '#4a9eff',

  // Card backgrounds
  card: {
    default: '#1a1a2e',
    crisis: '#2e1a1a',
    interlude: '#1a2e1a',
    conversation: '#1a1a3e',
    origin: '#2e2a1a',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
} as const;

export type MeterColor = keyof typeof colors.meter;
export type AgencyColor = keyof typeof colors.agency;
export type SwipeColor = keyof typeof colors.swipe;
