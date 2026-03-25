/**
 * Sovereign -- UI Store
 *
 * Manages UI-only state: unlocked tabs, active tab, world event phase,
 * overlay toggles (dice, trait ceremony, unlock animation), and meter
 * expansion state. Uses arrays internally for tab sets (Zustand compat).
 */

import { create } from 'zustand';
import type { WEP } from '../types';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface UIStore {
  /** Unlocked tab IDs (array internally, Set-like API). */
  _tabs: string[];
  activeTab: string;
  wep: WEP;
  showDice: boolean;
  showTraitCeremony: boolean;
  showUnlock: string | null;
  metersExpanded: boolean;

  unlockTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  isTabUnlocked: (tabId: string) => boolean;
  getTabs: () => Set<string>;
  setWep: (wep: WEP) => void;
  setShowDice: (show: boolean) => void;
  setShowTraitCeremony: (show: boolean) => void;
  setShowUnlock: (tabName: string | null) => void;
  toggleMetersExpanded: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Initial State
// ---------------------------------------------------------------------------

const INITIAL_TABS = ['home', 'cards'];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useUIStore = create<UIStore>((set, get) => ({
  _tabs: [...INITIAL_TABS],
  activeTab: 'home',
  wep: null,
  showDice: false,
  showTraitCeremony: false,
  showUnlock: null,
  metersExpanded: false,

  unlockTab: (tabId) =>
    set((state) => {
      if (state._tabs.includes(tabId)) return state;
      return { _tabs: [...state._tabs, tabId] };
    }),

  setActiveTab: (tabId) => set({ activeTab: tabId }),

  isTabUnlocked: (tabId) => get()._tabs.includes(tabId),

  getTabs: () => new Set(get()._tabs),

  setWep: (wep) => set({ wep }),

  setShowDice: (show) => set({ showDice: show }),

  setShowTraitCeremony: (show) => set({ showTraitCeremony: show }),

  setShowUnlock: (tabName) => set({ showUnlock: tabName }),

  toggleMetersExpanded: () =>
    set((state) => ({ metersExpanded: !state.metersExpanded })),

  reset: () =>
    set({
      _tabs: [...INITIAL_TABS],
      activeTab: 'home',
      wep: null,
      showDice: false,
      showTraitCeremony: false,
      showUnlock: null,
      metersExpanded: false,
    }),
}));
