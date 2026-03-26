// ─── Meter Definitions ────────────────────────────────────────────────────

import { MeterDef, MeterName, MeterZone } from '../types/meters';

/** Per-meter detail state used internally by meter data functions */
interface MeterDetailState {
  value: number;
  min: number;
  max: number;
  name: MeterName;
  label: string;
  icon: string;
}

export const METER_DEFS: Record<MeterName, MeterDef> = {
  authority: {
    name: 'authority',
    label: 'Authority',
    icon: '👑',
    description: 'Your grip on power. Too low and you are overthrown; too high and you become a tyrant.',
    deathLow: 'Your subjects no longer recognize your rule.',
    deathHigh: 'Your iron fist has crushed all who might support you.',
    startValue: 50,
    min: 0,
    max: 100,
  },
  populace: {
    name: 'populace',
    label: 'Populace',
    icon: '👥',
    description: 'The love of your people. Too low breeds revolt; too high and they demand more than you can give.',
    deathLow: 'The people storm the palace gates.',
    deathHigh: 'The mob you empowered now controls you.',
    startValue: 50,
    min: 0,
    max: 100,
  },
  treasury: {
    name: 'treasury',
    label: 'Treasury',
    icon: '💰',
    description: 'Your kingdom\'s wealth. Too low and you cannot feed your armies; too high and corruption festers.',
    deathLow: 'The coffers are empty. Creditors seize the throne.',
    deathHigh: 'Gold has poisoned every institution in your realm.',
    startValue: 50,
    min: 0,
    max: 100,
  },
  military: {
    name: 'military',
    label: 'Military',
    icon: '⚔️',
    description: 'Your armed forces\' strength. Too low invites invasion; too high and generals plot coups.',
    deathLow: 'Without an army, your borders crumble.',
    deathHigh: 'The generals have decided they no longer need a ruler.',
    startValue: 50,
    min: 0,
    max: 100,
  },
  stability: {
    name: 'stability',
    label: 'Stability',
    icon: '⚖️',
    description: 'The realm\'s order and peace. Too low means chaos; too high means stagnation.',
    deathLow: 'Chaos consumes every corner of the realm.',
    deathHigh: 'Your rigid order has suffocated all life from the kingdom.',
    startValue: 50,
    min: 0,
    max: 100,
  },
};

/** All meter names in display order */
export const METER_NAMES: MeterName[] = ['authority', 'populace', 'treasury', 'military', 'stability'];

/** Get the zone classification for a meter value */
export function getMeterZone(value: number): MeterZone {
  if (value <= 15) return 'critical';
  if (value <= 30) return 'warning';
  if (value >= 85) return 'excessive';
  return 'healthy';
}

/** Create initial meter detail states for a new game */
export function createInitialMeters(): Record<MeterName, MeterDetailState> {
  const meters = {} as Record<MeterName, MeterDetailState>;
  for (const def of Object.values(METER_DEFS)) {
    meters[def.name] = {
      value: def.startValue,
      min: def.min,
      max: def.max,
      name: def.name,
      label: def.label,
      icon: def.icon,
    };
  }
  return meters;
}

/** Clamp a meter value to its valid range */
export function clampMeter(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Check if any meter is at a death threshold (0 or 100) */
export function checkDeathCondition(meters: Record<MeterName, MeterDetailState>): MeterName | null {
  for (const name of METER_NAMES) {
    const meter = meters[name];
    if (meter.value <= 0 || meter.value >= 100) {
      return name;
    }
  }
  return null;
}
