// ─── UI Store ─────────────────────────────────────────────────────────────
// Manages tab state, modal visibility, and display preferences.

import { create } from 'zustand';

type TabKey = 'home' | 'cards';

interface UIStoreState {
  _tabs: TabKey[];
  activeTab: TabKey;
  wep: string | null;           // weekly event preview id
  showDice: boolean;
  showTraitCeremony: boolean;
  showUnlock: string | null;    // feature name being unlocked
  metersExpanded: boolean;

  setActiveTab: (tab: TabKey) => void;
  setWep: (id: string | null) => void;
  setShowDice: (show: boolean) => void;
  setShowTraitCeremony: (show: boolean) => void;
  setShowUnlock: (feature: string | null) => void;
  toggleMetersExpanded: () => void;
  resetUI: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  _tabs: ['home', 'cards'],
  activeTab: 'home',
  wep: null,
  showDice: false,
  showTraitCeremony: false,
  showUnlock: null,
  metersExpanded: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setWep: (id) => set({ wep: id }),
  setShowDice: (show) => set({ showDice: show }),
  setShowTraitCeremony: (show) => set({ showTraitCeremony: show }),
  setShowUnlock: (feature) => set({ showUnlock: feature }),
  toggleMetersExpanded: () => set((s) => ({ metersExpanded: !s.metersExpanded })),
  resetUI: () =>
    set({
      activeTab: 'home',
      wep: null,
      showDice: false,
      showTraitCeremony: false,
      showUnlock: null,
      metersExpanded: false,
    }),
}));
