/**
 * Sovereign -- Court Store
 *
 * Manages NPCs with loyalty, recruitment status, faction affiliations,
 * and district dispatch. Initializes from static NPC definitions.
 */

import { create } from 'zustand';
import type { NPCState, VoiceKey, FactionId } from '../types';
import { NPCS } from '../data';

// ---------------------------------------------------------------------------
// Store Interface
// ---------------------------------------------------------------------------

interface CourtStore {
  npcs: NPCState[];

  recruitNPC: (npcName: string) => void;
  updateLoyalty: (npcName: string, delta: number) => void;
  dispatchNPC: (npcName: string) => void;
  recallNPC: (npcName: string) => void;
  getNPC: (npcName: string) => NPCState | undefined;
  getRecruitedNPCs: () => NPCState[];
  resetCourt: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function createInitialNPCs(): NPCState[] {
  return NPCS.map((def) => ({
    name: def.name,
    loy: def.startingLoyalty,
    role: def.role,
    faction: def.faction ?? undefined,
    district: undefined,
    recruited: false,
    dispatched: false,
    conversations: 0,
    portrait: def.portrait,
    voiceKey: def.voiceKey,
  }));
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCourtStore = create<CourtStore>((set, get) => ({
  npcs: createInitialNPCs(),

  recruitNPC: (npcName) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.name === npcName ? { ...npc, recruited: true } : npc,
      ),
    })),

  updateLoyalty: (npcName, delta) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.name === npcName
          ? { ...npc, loy: clamp(npc.loy + delta, 0, 100) }
          : npc,
      ),
    })),

  dispatchNPC: (npcName) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.name === npcName ? { ...npc, dispatched: true } : npc,
      ),
    })),

  recallNPC: (npcName) =>
    set((state) => ({
      npcs: state.npcs.map((npc) =>
        npc.name === npcName
          ? { ...npc, dispatched: false, district: undefined }
          : npc,
      ),
    })),

  getNPC: (npcName) => get().npcs.find((npc) => npc.name === npcName),

  getRecruitedNPCs: () => get().npcs.filter((npc) => npc.recruited),

  resetCourt: () => set({ npcs: createInitialNPCs() }),
}));
