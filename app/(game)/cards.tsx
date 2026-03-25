/**
 * Sovereign -- Cards Tab (Core Game Loop)
 *
 * Polymorphic content area that renders the appropriate component based
 * on the current game state. Handles the full card lifecycle:
 *
 * 1. If in origin phase: delegate to OriginPhase orchestrator
 * 2. If no current card: call selectNextCard() from card-selector
 * 3. Based on card type/state, render appropriate component:
 *    - Regular card -> SwipeCard
 *    - wep='narration' -> WorldNarration -> then wep='reaction' -> SwipeCard
 *    - Interlude -> Interlude component
 *    - Conversation -> ConversationView (stub)
 *    - Impact -> ImpactSummary
 * 4. On card commit:
 *    - Apply meter effects (with dice multiplier if applicable)
 *    - Set flags
 *    - Queue follow-ups
 *    - Show ImpactSummary
 *    - After impact: advance week if needed, select next card
 * 5. Wire dice: if option has dice check, show DiceOverlay before applying effects
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY -- card lifecycle, swipe mechanics
 * @see SOV_PRD_07_NARRATIVE_ENGINE -- card selector, text resolver
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import type {
  Card,
  InterludeCard,
  ConversationCard,
  Direction,
  TextContext,
  MeterDelta,
  MeterEffects,
  DiceResult,
  DiceCheck,
} from '../../types';
import { METER_NAMES, type MeterName } from '../../types';
import {
  useGameStore,
  useCardStore,
  useUIStore,
  useConversationStore,
  useMeterStore,
  useCourtStore,
  useDistrictStore,
  useMemoryStore,
} from '../../stores';
import { selectNextCard, type CardSelectorContext } from '../../services/game/card-selector';
import { resolveText } from '../../services/game/text-resolver';
// Dice rolling happens inside DiceOverlay via useDiceRoll hook

// Components
import { OriginPhase } from '../../components/screens/OriginPhase';
import { SwipeCard } from '../../components/cards/SwipeCard';
import { WorldNarration } from '../../components/cards/WorldNarration';
import { Interlude } from '../../components/cards/Interlude';
import { ImpactSummary } from '../../components/cards/ImpactSummary';
import { DiceOverlay } from '../../components/dice/DiceOverlay';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardScreenPhase =
  | 'idle'          // no card, selecting next
  | 'narration'     // world event narration phase
  | 'card'          // showing swipe card
  | 'interlude'     // showing interlude
  | 'conversation'  // showing conversation (stub)
  | 'dice'          // dice overlay before impact
  | 'impact';       // showing impact summary

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isInterludeCard(card: Card | InterludeCard | ConversationCard): card is InterludeCard {
  return card.agency === 'interlude';
}

function isConversationCard(card: Card | InterludeCard | ConversationCard): card is ConversationCard {
  return card.agency === 'conversation';
}

function isSwipeCard(card: Card | InterludeCard | ConversationCard): card is Card {
  return !isInterludeCard(card) && !isConversationCard(card);
}

/** Safely extract a display title from any card type. */
function getCardTitle(card: Card | InterludeCard | ConversationCard): string {
  if ('title' in card && card.title != null) {
    return typeof card.title === 'string' ? card.title : '[Dynamic Title]';
  }
  if ('npcName' in card) {
    return card.npcName;
  }
  return '[Card]';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CardsScreen() {
  // ── Store selectors ─────────────────────────────────────────────────────

  const phase = useGameStore((s) => s.phase);
  const originComplete = useGameStore((s) => s.originComplete);
  const week = useGameStore((s) => s.week);
  const act = useGameStore((s) => s.act);
  const trait = useGameStore((s) => s.trait);
  const corruption = useGameStore((s) => s.corruption);
  const cardsPlayed = useGameStore((s) => s.cardsPlayed);

  const currentCard = useCardStore((s) => s.currentCard);
  const cardQueue = useCardStore((s) => s.cardQueue);
  const setCurrentCard = useCardStore((s) => s.setCurrentCard);
  const queueFollowUp = useCardStore((s) => s.queueFollowUp);

  const wep = useUIStore((s) => s.wep);
  const setWep = useUIStore((s) => s.setWep);
  const showDice = useUIStore((s) => s.showDice);
  const setShowDice = useUIStore((s) => s.setShowDice);

  const conversationActive = useConversationStore((s) => s.active);

  const meters = useMeterStore((s) => s.meters);
  const applyMeters = useMeterStore((s) => s.applyMeters);
  const checkDeath = useMeterStore((s) => s.checkDeath);

  const npcs = useCourtStore((s) => s.npcs);
  const recruitNPC = useCourtStore((s) => s.recruitNPC);
  const updateLoyalty = useCourtStore((s) => s.updateLoyalty);

  const districts = useDistrictStore((s) => s.districts);

  const getFlags = useMemoryStore((s) => s.getFlags);
  const getCardsPlayed = useMemoryStore((s) => s.getCardsPlayed);
  const addFlags = useMemoryStore((s) => s.addFlags);
  const addChoice = useMemoryStore((s) => s.addChoice);
  const markCardPlayed = useMemoryStore((s) => s.markCardPlayed);
  const addWitnessed = useMemoryStore((s) => s.addWitnessed);

  // ── Local state ─────────────────────────────────────────────────────────

  const [screenPhase, setScreenPhase] = useState<CardScreenPhase>('idle');
  const [impactDirection, setImpactDirection] = useState<Direction | null>(null);
  const [impactLabel, setImpactLabel] = useState('');
  const [impactNarrative, setImpactNarrative] = useState<string | undefined>(undefined);
  const [impactDeltas, setImpactDeltas] = useState<MeterDelta[]>([]);
  const [impactDiceResult, setImpactDiceResult] = useState<DiceResult | undefined>(undefined);
  const [pendingDiceCheck, setPendingDiceCheck] = useState<DiceCheck | null>(null);
  const [pendingDirection, setPendingDirection] = useState<Direction | null>(null);

  // ── TextContext ──────────────────────────────────────────────────────────

  const textContext: TextContext = useMemo(() => ({
    memory: {
      flags: getFlags(),
      choices: useMemoryStore.getState().choices,
      witnessed: useMemoryStore.getState().getWitnessed(),
      cardsPlayed: getCardsPlayed(),
    },
    npcs,
    trait,
    week,
    act,
    corruption,
    meters,
  }), [meters, npcs, trait, week, act, corruption]);

  // ── Card Selection ──────────────────────────────────────────────────────

  // Auto-select next card when idle
  useEffect(() => {
    if (!originComplete) return;     // OriginPhase handles its own cards
    if (currentCard) return;          // Already have a card
    if (screenPhase !== 'idle') return;

    const ctx: CardSelectorContext = {
      cardsPlayed,
      cardQueue,
      playedCards: getCardsPlayed(),
      week,
      act,
      flags: getFlags(),
      meters,
      npcs,
      districts,
      trait,
      corruption,
    };

    const nextCard = selectNextCard(ctx);
    if (!nextCard) return;

    // Dequeue follow-up if that's what was selected
    if (cardQueue.length > 0 && nextCard.id === cardQueue[0]) {
      useCardStore.getState().dequeueFollowUp();
    }

    setCurrentCard(nextCard);

    // Determine initial screen phase based on card type
    if (isInterludeCard(nextCard)) {
      setScreenPhase('interlude');
    } else if (isConversationCard(nextCard)) {
      setScreenPhase('conversation');
    } else if (isSwipeCard(nextCard) && nextCard.worldEvent) {
      setWep('narration');
      setScreenPhase('narration');
    } else {
      setWep(null);
      setScreenPhase('card');
    }
  }, [currentCard, screenPhase, originComplete]);

  // ── World Event Narration ───────────────────────────────────────────────

  const handleNarrationReaction = useCallback(() => {
    if (!currentCard || !isSwipeCard(currentCard)) return;

    // Apply autoMeters from world/crisis event
    if (currentCard.autoMeters) {
      applyMeters(currentCard.autoMeters);
    }

    // Switch to reaction phase
    setWep('reaction');
    setScreenPhase('card');
  }, [currentCard]);

  // ── Swipe Commit ────────────────────────────────────────────────────────

  const handleCommit = useCallback(
    (direction: Direction) => {
      if (!currentCard || !isSwipeCard(currentCard)) return;

      const option = currentCard[direction];
      if (!option) return;

      const label = resolveText(option.label, textContext);

      // Save direction for later use
      setPendingDirection(direction);

      // Check for dice
      if (option.dice) {
        setPendingDiceCheck(option.dice);
        setImpactDirection(direction);
        setImpactLabel(label);
        setShowDice(true);
        setScreenPhase('dice');
        return;
      }

      // No dice -- apply effects directly
      applyCommitEffects(direction, option, label, currentCard);
    },
    [currentCard, textContext],
  );

  // ── Dice Result ─────────────────────────────────────────────────────────

  const handleDiceResult = useCallback(
    (result: DiceResult) => {
      if (!currentCard || !isSwipeCard(currentCard) || !pendingDirection) return;

      const option = currentCard[pendingDirection];
      if (!option || !option.dice) return;

      const label = resolveText(option.label, textContext);
      const diceCheck = option.dice;

      // Determine which meters to apply
      const metersToApply = result.success
        ? diceCheck.successMeters
        : diceCheck.failMeters;
      const multiplier = result.success ? 1.0 : 0.3;

      // Determine narrative
      const narrativeText = result.success
        ? (option.successNarr
            ? resolveText(option.successNarr, textContext)
            : option.narr
              ? resolveText(option.narr, textContext)
              : undefined)
        : (option.failNarr
            ? resolveText(option.failNarr, textContext)
            : option.narr
              ? resolveText(option.narr, textContext)
              : undefined);

      // Apply meter effects with multiplier
      const deltas: MeterDelta[] = [];
      if (metersToApply) {
        for (const name of METER_NAMES) {
          const val = metersToApply[name as keyof MeterEffects];
          if (val != null && val !== 0) {
            const scaled = Math.round(val * multiplier);
            if (scaled !== 0) {
              deltas.push({ meter: name, amount: scaled });
            }
          }
        }
        applyMeters(metersToApply, multiplier);
      }

      // Apply other option effects (flags, corruption, NPC, etc.)
      applyOptionSideEffects(pendingDirection, option, label, currentCard);

      // Store impact data
      setImpactDirection(pendingDirection);
      setImpactLabel(label);
      setImpactNarrative(narrativeText);
      setImpactDeltas(deltas);
      setImpactDiceResult(result);

      // Dismiss dice overlay after a delay, then show impact
      setTimeout(() => {
        setShowDice(false);
        setPendingDiceCheck(null);
        setScreenPhase('impact');
      }, 1800);
    },
    [currentCard, pendingDirection, textContext],
  );

  // ── Effect Application (non-dice path) ──────────────────────────────────

  const applyCommitEffects = useCallback(
    (
      direction: Direction,
      option: Card['left'],
      label: string,
      card: Card,
    ) => {
      if (!option) return;

      const narr = option.narr
        ? resolveText(option.narr, textContext)
        : undefined;

      // Apply meter effects (full potency)
      const effects = option.meters;
      const deltas: MeterDelta[] = [];
      if (effects) {
        for (const name of METER_NAMES) {
          const val = effects[name as keyof MeterEffects];
          if (val != null && val !== 0) {
            deltas.push({ meter: name, amount: val });
          }
        }
        applyMeters(effects);
      }

      // Apply side effects
      applyOptionSideEffects(direction, option, label, card);

      // Store impact data
      setImpactDirection(direction);
      setImpactLabel(label);
      setImpactNarrative(narr);
      setImpactDeltas(deltas);
      setImpactDiceResult(undefined);

      setScreenPhase('impact');
    },
    [textContext],
  );

  /**
   * Apply non-meter side effects from a card option:
   * corruption, flags, NPC effects, choice recording.
   */
  const applyOptionSideEffects = useCallback(
    (
      direction: Direction,
      option: Card['left'],
      label: string,
      card: Card,
    ) => {
      if (!option) return;

      // Corruption
      if (option.corrupt) {
        useGameStore.getState().addCorruption(option.corrupt);
      }

      // Flags from option
      if (option.setFlags) {
        addFlags(...option.setFlags);
      }

      // Flags from card
      if (card.setFlags) {
        const flags =
          typeof card.setFlags === 'function'
            ? card.setFlags(textContext)
            : card.setFlags;
        addFlags(...flags);
      }

      // Trait assignment
      if (option.trait) {
        useGameStore.getState().setTrait(option.trait);
      }

      // NPC recruitment
      if (option.npcRecruit) {
        recruitNPC(option.npcRecruit.name);
      }

      // NPC loyalty
      if (option.npcEffect) {
        updateLoyalty(option.npcEffect.name, option.npcEffect.delta);
      }

      // Follow-up
      if (option.followUp) {
        queueFollowUp(option.followUp);
      }

      // Record choice
      addChoice({
        cardId: card.id,
        direction,
        label,
        week: useGameStore.getState().week,
      });
      markCardPlayed(card.id);
      useGameStore.getState().incrementCardsPlayed();
    },
    [textContext],
  );

  // ── Impact Advance ──────────────────────────────────────────────────────

  const handleImpactAdvance = useCallback(() => {
    // Check for death
    const death = checkDeath();
    if (death) {
      useGameStore.getState().setPhase('death');
      return;
    }

    // Clear card and reset for next selection
    setCurrentCard(null);
    setWep(null);
    setScreenPhase('idle');
    setImpactDirection(null);
    setImpactLabel('');
    setImpactNarrative(undefined);
    setImpactDeltas([]);
    setImpactDiceResult(undefined);
    setPendingDirection(null);

    // Advance week every 3 cards (approximate pacing)
    const currentCardsPlayed = useGameStore.getState().cardsPlayed;
    if (currentCardsPlayed > 0 && currentCardsPlayed % 3 === 0) {
      useGameStore.getState().advanceWeek();
    }
  }, []);

  // ── Interlude Complete ──────────────────────────────────────────────────

  const handleInterludeComplete = useCallback(() => {
    if (!currentCard || !isInterludeCard(currentCard)) return;

    // Set flags
    if (currentCard.setFlags) {
      addFlags(...currentCard.setFlags);
    }

    // Mark as witnessed (dramatic irony)
    addWitnessed(currentCard.id);
    markCardPlayed(currentCard.id);
    useGameStore.getState().incrementCardsPlayed();

    // Clear and proceed
    setCurrentCard(null);
    setScreenPhase('idle');
  }, [currentCard]);

  // ── Render ──────────────────────────────────────────────────────────────

  // During origin phase, delegate entirely to OriginPhase
  if (!originComplete) {
    return <OriginPhase />;
  }

  const renderContent = () => {
    // Conversation active (stub)
    if (conversationActive) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>{'\uD83D\uDCAC'}</Text>
          <Text style={styles.placeholderTitle}>Conversation</Text>
          <Text style={styles.placeholderText}>
            ConversationView component coming soon
          </Text>
        </View>
      );
    }

    // Impact summary
    if (screenPhase === 'impact' && impactDirection) {
      return (
        <ImpactSummary
          direction={impactDirection}
          label={impactLabel}
          diceResult={impactDiceResult}
          narrative={impactNarrative}
          meterDeltas={impactDeltas}
          onAdvance={handleImpactAdvance}
        />
      );
    }

    // No card -- loading state
    if (!currentCard) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Drawing next card...</Text>
        </View>
      );
    }

    // Interlude
    if (screenPhase === 'interlude' && isInterludeCard(currentCard)) {
      return (
        <Interlude
          card={currentCard}
          textContext={textContext}
          onComplete={handleInterludeComplete}
        />
      );
    }

    // World event narration phase
    if (screenPhase === 'narration' && isSwipeCard(currentCard)) {
      return (
        <WorldNarration
          card={currentCard}
          textContext={textContext}
          onReaction={handleNarrationReaction}
        />
      );
    }

    // Conversation card (stub)
    if (screenPhase === 'conversation' && isConversationCard(currentCard)) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>{'\uD83D\uDCAC'}</Text>
          <Text style={styles.placeholderTitle}>{currentCard.npcName}</Text>
          <Text style={styles.placeholderText}>
            ConversationView component coming soon
          </Text>
        </View>
      );
    }

    // Default: SwipeCard
    if (isSwipeCard(currentCard)) {
      return (
        <SwipeCard
          card={currentCard}
          onCommit={handleCommit}
          textContext={textContext}
        />
      );
    }

    // Fallback
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      {/* Dice overlay on top when rolling */}
      {showDice && pendingDiceCheck && (
        <DiceOverlay
          visible={showDice}
          die={pendingDiceCheck.die}
          modifier={pendingDiceCheck.modifier}
          onResult={handleDiceResult}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  placeholderTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
