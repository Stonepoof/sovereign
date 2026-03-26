// ─── Court Store ──────────────────────────────────────────────────────────
// Manages NPC court members: recruitment, loyalty, dispatch/recall.

import { create } from 'zustand';
import { NPCState } from '../types';

function clampLoyalty(v: number): number {
  return Math.max(0, Math.min(100, v));
}

interface CourtStoreState {
  npcs: NPCState[];

  recruit: (npc: NPCState) => void;
  updateLoyalty: (npcId: string, delta: number) => void;
  dispatch: (npcId: string) => void;
  recall: (npcId: string) => void;
  getNPC: (id: string) => NPCState | undefined;
  getRecruitedNPCs: () => NPCState[];
  resetCourt: () => void;
}

export const useCourtStore = create<CourtStoreState>((set, get) => ({
  npcs: [],

  recruit: (npc) => {
    const exists = get().npcs.find((n) => n.id === npc.id);
    if (exists) return;
    set((s) => ({
      npcs: [...s.npcs, { ...npc, recruited: true }],
    }));
  },

  updateLoyalty: (npcId, delta) => {
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.id === npcId
          ? { ...n, loyalty: clampLoyalty(n.loyalty + delta) }
          : n,
      ),
    }));
  },

  dispatch: (npcId) => {
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.id === npcId ? { ...n, recruited: false } : n,
      ),
    }));
  },

  recall: (npcId) => {
    set((s) => ({
      npcs: s.npcs.map((n) =>
        n.id === npcId ? { ...n, recruited: true } : n,
      ),
    }));
  },

  getNPC: (id) => get().npcs.find((n) => n.id === id),

  getRecruitedNPCs: () => get().npcs.filter((n) => n.recruited),

  resetCourt: () => set({ npcs: [] }),
}));
