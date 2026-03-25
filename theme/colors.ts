export const colors = {
  // Core
  background: '#0a0a1a',
  surface: '#1a1a2e',
  surfaceDark: '#0d0d20',
  surfaceLight: '#252540',
  card: '#1e1e38',
  cardBorder: '#2a2a4a',

  // Text
  textPrimary: '#e8e8f0',
  textSecondary: '#a0a0b8',
  textMuted: '#6a6a80',
  textAccent: '#ffd700',

  // Accent
  gold: '#ffd700',
  goldDark: '#b8960f',
  accent: '#7c4dff',
  accentLight: '#b388ff',

  // Meters (Sovereign governance stats)
  authority: '#dc3545',
  authorityBg: '#4a1515',
  populace: '#4a9eff',
  populaceBg: '#152a4a',
  treasury: '#f0ad4e',
  treasuryBg: '#4a3a15',
  military: '#28a745',
  militaryBg: '#1a4a1a',
  stability: '#8b5cf6',
  stabilityBg: '#2a1a4a',

  // Agency Types
  agencyWorld: '#4a9eff',
  agencyPetition: '#f0ad4e',
  agencyPersonal: '#dc3545',
  agencyAction: '#28a745',
  agencyCrisis: '#ff6b35',
  agencyReaction: '#9c27b0',
  agencyInterlude: '#6c757d',
  agencyConversation: '#17a2b8',
  agencyDistrict: '#795548',

  // Swipe Directions
  swipeUp: '#4a9eff',
  swipeDown: '#6c757d',
  swipeLeft: '#dc3545',
  swipeRight: '#28a745',

  // Rarity
  rarityB: '#4caf50',
  rarityA: '#2196f3',
  rarityS: '#9c27b0',
  raritySS: '#ffd700',

  // Relationship
  hostile: '#ff0000',
  suspicious: '#ff6600',
  neutral: '#cccccc',
  friendly: '#66cc00',
  allied: '#00ccff',
  bonded: '#ff66ff',

  // UI
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  // Navigation
  navActive: '#ffd700',
  navInactive: '#6a6a80',
  navBackground: '#0d0d20',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Borders
  border: '#2a2a4a',
  borderLight: '#3a3a5a',
  borderGold: '#ffd700',
};

export type ColorKey = keyof typeof colors;
