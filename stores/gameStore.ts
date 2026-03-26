// ─── Game Store ──────────────────────────────────────────────────────────────
// Central Zustand store for Sovereign game state.

import { create } from 'zustand';
import type {
  MeterState,
  MeterKey,
  MeterDelta,
  GamePhase,
  CardSubPhase,
  Trait,
  NPC,
  District,
  World,
  GameCard,
  OriginCard,
  FactionId,
} from '../types';

// ─── State Shape ─────────────────────────────────────────────────────────────
interface GameState {
  // World selection
  selectedWorld: World | null;

  // Game progression
  phase: GamePhase;
  subPhase: CardSubPhase;
  week: number;
  act: number;
  originStep: number; // 1-8

  // Meters
  meters: MeterState;

  // Trait
  trait: Trait | null;

  // Cards
  currentCard: GameCard | null;
  cardQueue: GameCard[];

  // Court
  npcs: NPC[];

  // Map
  districts: District[];
  selectedDistrict: District | null;

  // Tab unlocks
  unlockedTabs: string[];

  // Death
  deathNarrative: string;

  // Conversation
  rapport: number;

  // Actions
  selectWorld: (world: World) => void;
  setPhase: (phase: GamePhase) => void;
  setSubPhase: (subPhase: CardSubPhase) => void;
  setOriginStep: (step: number) => void;
  applyMeterDeltas: (deltas: MeterDelta[]) => void;
  setMeter: (key: MeterKey, value: number) => void;
  setTrait: (trait: Trait) => void;
  setCurrentCard: (card: GameCard | null) => void;
  enqueueCards: (cards: GameCard[]) => void;
  advanceCard: () => void;
  advanceWeek: () => void;
  setNPCs: (npcs: NPC[]) => void;
  updateNPCLoyalty: (npcId: string, delta: number) => void;
  recruitNPC: (npcId: string) => void;
  setDistricts: (districts: District[]) => void;
  selectDistrict: (district: District | null) => void;
  unlockTab: (tabKey: string) => void;
  setDeathNarrative: (narrative: string) => void;
  setRapport: (value: number) => void;
  resetGame: () => void;
}

// ─── Default Meters ──────────────────────────────────────────────────────────
const DEFAULT_METERS: MeterState = {
  authority: 50,
  populace: 50,
  treasury: 50,
  military: 50,
  stability: 50,
};

// ─── Default Districts ───────────────────────────────────────────────────────
const DEFAULT_DISTRICTS: District[] = [
  { id: 'palace', name: 'Palace', x: 195, y: 40, unrest: 10, connectedTo: ['market', 'temple'], population: 500, income: 100 },
  { id: 'market', name: 'Market', x: 80, y: 90, unrest: 25, connectedTo: ['palace', 'docks', 'slums'], population: 2000, income: 300 },
  { id: 'temple', name: 'Temple', x: 310, y: 90, unrest: 15, connectedTo: ['palace', 'barracks'], population: 800, income: 50 },
  { id: 'docks', name: 'Docks', x: 120, y: 160, unrest: 40, connectedTo: ['market', 'slums'], population: 1500, income: 200 },
  { id: 'slums', name: 'Slums', x: 270, y: 160, unrest: 60, connectedTo: ['market', 'docks', 'barracks'], population: 3000, income: 20 },
];

// ─── Default NPCs ────────────────────────────────────────────────────────────
const DEFAULT_NPCS: NPC[] = [
  { id: 'advisor', name: 'Lord Aldric', role: 'Royal Advisor', loyalty: 70, faction: 'crown', recruited: true },
  { id: 'merchant', name: 'Sera Goldweave', role: 'Guild Master', loyalty: 45, faction: 'merchant', recruited: true },
  { id: 'general', name: 'Commander Kael', role: 'General', loyalty: 60, faction: 'military', recruited: true },
  { id: 'priest', name: 'High Priest Maren', role: 'High Priest', loyalty: 55, faction: 'faith', recruited: false },
  { id: 'spy', name: 'Whisper', role: 'Spymaster', loyalty: 30, faction: 'shadow', recruited: false },
];

// ─── Store ───────────────────────────────────────────────────────────────────
export const useGameStore = create<GameState>((set, get) => ({
  selectedWorld: null,
  phase: 'origin',
  subPhase: 'narration',
  week: 1,
  act: 1,
  originStep: 1,
  meters: { ...DEFAULT_METERS },
  trait: null,
  currentCard: null,
  cardQueue: [],
  npcs: [...DEFAULT_NPCS],
  districts: [...DEFAULT_DISTRICTS],
  selectedDistrict: null,
  unlockedTabs: ['home', 'cards'],
  deathNarrative: '',
  rapport: 50,

  selectWorld: (world) => set({ selectedWorld: world }),

  setPhase: (phase) => set({ phase }),

  setSubPhase: (subPhase) => set({ subPhase }),

  setOriginStep: (step) => set({ originStep: step }),

  applyMeterDeltas: (deltas) =>
    set((state) => {
      const next = { ...state.meters } as Record<string, number>;
      for (const d of deltas) {
        next[d.meter] = Math.max(0, Math.min(100, (next[d.meter] ?? 50) + d.delta));
      }
      // Check death condition: any meter at 0 or 100
      const isDead = Object.values(next).some((v) => v <= 0 || v >= 100);
      return {
        meters: next as MeterState,
        phase: isDead ? 'death' : state.phase,
      };
    }),

  setMeter: (key, value) =>
    set((state) => ({
      meters: { ...state.meters, [key]: Math.max(0, Math.min(100, value)) },
    })),

  setTrait: (trait) => set({ trait }),

  setCurrentCard: (card) => set({ currentCard: card }),

  enqueueCards: (cards) =>
    set((state) => ({ cardQueue: [...state.cardQueue, ...cards] })),

  advanceCard: () =>
    set((state) => {
      const [next, ...rest] = state.cardQueue;
      return { currentCard: next ?? null, cardQueue: rest };
    }),

  advanceWeek: () =>
    set((state) => {
      const newWeek = state.week + 1;
      const newAct = Math.floor((newWeek - 1) / 10) + 1;
      // Unlock tabs based on week
      const tabs = [...state.unlockedTabs];
      if (newWeek >= 3 && !tabs.includes('map')) tabs.push('map');
      if (newWeek >= 5 && !tabs.includes('court')) tabs.push('court');
      if (newWeek >= 8 && !tabs.includes('policy')) tabs.push('policy');
      if (newWeek >= 12 && !tabs.includes('shop')) tabs.push('shop');
      return { week: newWeek, act: newAct, unlockedTabs: tabs };
    }),

  setNPCs: (npcs) => set({ npcs }),

  updateNPCLoyalty: (npcId, delta) =>
    set((state) => ({
      npcs: state.npcs.map((n) =>
        n.id === npcId
          ? { ...n, loyalty: Math.max(0, Math.min(100, n.loyalty + delta)) }
          : n
      ),
    })),

  recruitNPC: (npcId) =>
    set((state) => ({
      npcs: state.npcs.map((n) =>
        n.id === npcId ? { ...n, recruited: true } : n
      ),
    })),

  setDistricts: (districts) => set({ districts }),

  selectDistrict: (district) => set({ selectedDistrict: district }),

  unlockTab: (tabKey) =>
    set((state) => ({
      unlockedTabs: state.unlockedTabs.includes(tabKey)
        ? state.unlockedTabs
        : [...state.unlockedTabs, tabKey],
    })),

  setDeathNarrative: (narrative) => set({ deathNarrative: narrative }),

  setRapport: (value) => set({ rapport: Math.max(0, Math.min(100, value)) }),

  resetGame: () =>
    set({
      phase: 'origin',
      subPhase: 'narration',
      week: 1,
      act: 1,
      originStep: 1,
      meters: { ...DEFAULT_METERS },
      trait: null,
      currentCard: null,
      cardQueue: [],
      npcs: [...DEFAULT_NPCS],
      districts: [...DEFAULT_DISTRICTS],
      selectedDistrict: null,
      unlockedTabs: ['home', 'cards'],
      deathNarrative: '',
      rapport: 50,
    }),
}));
