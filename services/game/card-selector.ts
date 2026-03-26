// ─── Card Selector ────────────────────────────────────────────────────────
// 5-priority queue for selecting the next card:
//   1. Followups        (immediate response to previous card)
//   2. Conversations    (every 6th card)
//   3. Interludes       (every 8th card)
//   4. District events  (district with highest unrest)
//   5. Base agency cards (random from eligible pool)

import { Card, InterludeCard, ConversationCard, DistrictState, TextContext } from '../../types';

export interface CardPool {
  followups: Card[];
  conversations: ConversationCard[];
  interludes: InterludeCard[];
  districtCards: Card[];
  baseCards: Card[];
}

export interface SelectorContext {
  cardsPlayedCount: number;
  textContext: TextContext;
  completedCards: string[];
  districts: DistrictState[];
}

type AnyPoolCard = Card | InterludeCard | ConversationCard;

/** Check if a card's condition is met */
function isCardEligible(card: Card, ctx: SelectorContext): boolean {
  if (card.condition && !card.condition(ctx.textContext)) return false;
  if (card.minTurn && ctx.textContext.turn < card.minTurn) return false;
  if (card.maxPlays !== undefined) {
    const playCount = ctx.completedCards.filter((id) => id === card.id).length;
    if (playCount >= card.maxPlays) return false;
  }
  return true;
}

/** Select the next card from the pool based on priority queue */
export function selectNextCard(pool: CardPool, ctx: SelectorContext): AnyPoolCard | null {
  // Priority 1: Followups always go first
  if (pool.followups.length > 0) {
    return pool.followups[0];
  }

  // Priority 2: Conversations every 6th card
  if (ctx.cardsPlayedCount > 0 && ctx.cardsPlayedCount % 6 === 0) {
    if (pool.conversations.length > 0) {
      const eligible = pool.conversations.filter((c) =>
        !c.condition || c.condition(ctx.textContext),
      );
      if (eligible.length > 0) {
        return eligible[Math.floor(Math.random() * eligible.length)];
      }
    }
  }

  // Priority 3: Interludes every 8th card
  if (ctx.cardsPlayedCount > 0 && ctx.cardsPlayedCount % 8 === 0) {
    if (pool.interludes.length > 0) {
      const eligible = pool.interludes.filter((c) =>
        !c.condition || c.condition(ctx.textContext),
      );
      if (eligible.length > 0) {
        return eligible[Math.floor(Math.random() * eligible.length)];
      }
    }
  }

  // Priority 4: District events (highest unrest district)
  if (pool.districtCards.length > 0 && ctx.districts.length > 0) {
    const worstDistrict = ctx.districts.reduce((a, b) => (a.unrest > b.unrest ? a : b));
    if (worstDistrict.unrest > 40) {
      const districtEvent = pool.districtCards.find((c) =>
        c.tags?.includes(`district:${worstDistrict.id}`) && isCardEligible(c, ctx),
      );
      if (districtEvent) return districtEvent;
    }
  }

  // Priority 5: Base cards (weighted random from eligible)
  const eligible = pool.baseCards.filter((c) => isCardEligible(c, ctx));
  if (eligible.length > 0) {
    // Weighted selection
    const totalWeight = eligible.reduce((sum, c) => sum + (c.weight ?? 1), 0);
    let roll = Math.random() * totalWeight;
    for (const card of eligible) {
      roll -= card.weight ?? 1;
      if (roll <= 0) return card;
    }
    return eligible[eligible.length - 1];
  }

  return null;
}

/** Remove a card from followup queue after it's been played */
export function consumeFollowup(pool: CardPool): CardPool {
  return {
    ...pool,
    followups: pool.followups.slice(1),
  };
}
