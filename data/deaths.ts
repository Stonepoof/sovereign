// ─── Death Narratives ─────────────────────────────────────────────────────
// Each meter has a low-death and high-death narrative.

import { MeterName } from '../types/meters';

export interface DeathNarrative {
  meter: MeterName;
  extreme: 'low' | 'high';
  title: string;
  narrative: string;
  epitaph: string;
}

export const DEATH_NARRATIVES: DeathNarrative[] = [
  // Authority
  {
    meter: 'authority',
    extreme: 'low',
    title: 'The Deposed Monarch',
    narrative: 'Your grip on power slipped away like sand through trembling fingers. The court no longer bows, the guards no longer salute. One cold morning, you wake to find the palace doors barred — from the outside.',
    epitaph: 'They ruled briefly, and were forgotten faster.',
  },
  {
    meter: 'authority',
    extreme: 'high',
    title: 'The Tyrant\'s End',
    narrative: 'You crushed every dissenter, silenced every critic, controlled every thought. But a throne built on fear needs only one crack. The poison in your wine was placed by the last person you trusted.',
    epitaph: 'They held power so tightly it shattered in their hands.',
  },

  // Populace
  {
    meter: 'populace',
    extreme: 'low',
    title: 'The People\'s Wrath',
    narrative: 'The hungry cannot be reasoned with. The forgotten will not forgive. The mob surged through the streets like a river breaking its banks, and your palace became your tomb.',
    epitaph: 'They forgot that crowns are worn at the people\'s pleasure.',
  },
  {
    meter: 'populace',
    extreme: 'high',
    title: 'The Puppet Sovereign',
    narrative: 'You gave them everything they asked for, and they only asked for more. The people\'s councils now draft the laws, the people\'s courts pass judgement, and the people\'s champion sits in your chair. You watch from a window, technically still crowned, effectively a ghost.',
    epitaph: 'They loved the people so much they let them take everything.',
  },

  // Treasury
  {
    meter: 'treasury',
    extreme: 'low',
    title: 'Bankrupt Kingdom',
    narrative: 'The last gold coin left the treasury months ago. The soldiers fight for scraps, the roads crumble, the merchants flee. Foreign creditors arrive with armies instead of ledgers.',
    epitaph: 'They learned that even kingdoms have a bottom line.',
  },
  {
    meter: 'treasury',
    extreme: 'high',
    title: 'The Golden Rot',
    narrative: 'Mountains of gold filled every vault, but corruption seeped into every stone. Officials sold justice, generals sold loyalty, and in the end, someone sold your crown to the highest bidder.',
    epitaph: 'They drowned in gold and wondered why they couldn\'t breathe.',
  },

  // Military
  {
    meter: 'military',
    extreme: 'low',
    title: 'The Undefended Realm',
    narrative: 'Without swords, borders are merely lines in the dirt. The invasion came not with thunder but with quiet certainty. Your neighbors divided your kingdom over breakfast.',
    epitaph: 'They chose peace and received conquest.',
  },
  {
    meter: 'military',
    extreme: 'high',
    title: 'The Generals\' Coup',
    narrative: 'You built the mightiest army the realm had ever seen, and it was magnificent — until the generals realized they no longer needed permission. The coup was efficient, professional, and utterly bloodless. Almost polite.',
    epitaph: 'They forged a sword and it turned in their hand.',
  },

  // Stability
  {
    meter: 'stability',
    extreme: 'low',
    title: 'The Shattered Realm',
    narrative: 'Order collapsed like a house of cards in a hurricane. Every district became its own kingdom, every street its own battlefield. You sit in a palace surrounded by chaos, a monarch ruling nothing.',
    epitaph: 'They watched the realm tear itself apart and could not hold it together.',
  },
  {
    meter: 'stability',
    extreme: 'high',
    title: 'The Frozen Kingdom',
    narrative: 'Your obsession with order created a realm of perfect stillness — and perfect lifelessness. No art, no joy, no dissent, no growth. The kingdom didn\'t die; it simply stopped living.',
    epitaph: 'They built a perfect machine and forgot to leave room for a soul.',
  },
];

/** Get the death narrative for a specific meter and extreme */
export function getDeathNarrative(meter: MeterName, extreme: 'low' | 'high'): DeathNarrative | undefined {
  return DEATH_NARRATIVES.find((d) => d.meter === meter && d.extreme === extreme);
}

/** Get the death narrative based on a meter at 0 or 100 */
export function getDeathForMeter(meter: MeterName, value: number): DeathNarrative | undefined {
  if (value <= 0) return getDeathNarrative(meter, 'low');
  if (value >= 100) return getDeathNarrative(meter, 'high');
  return undefined;
}
