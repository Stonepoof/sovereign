/**
 * Sovereign -- OriginPhase Screen
 *
 * Orchestrator for the 8-card interleaved onboarding sequence. This is
 * a state machine managing the entire origin flow from card 0 through 7.
 *
 * Pattern: REAL -> FLASH -> REAL -> FLASH -> WORLD -> REACTION -> ALLIANCE -> FINALE
 *
 * Flow per card:
 * 1. Show Bridge transition (except card 0)
 * 2. For card 5 (world event): show WorldNarration, then SwipeCard for card 6
 * 3. For normal cards: show SwipeCard, wait for commit
 * 4. After commit: show ImpactSummary with meter effects
 * 5. Apply meter effects to meter-store
 * 6. Set flags in memory-store
 * 7. At card 6: show TraitCeremony overlay
 * 8. At card 7: show UnlockOverlay (court)
 * 9. At card 8 completion: show UnlockOverlay (map), navigate to game
 *
 * Progressive disclosure:
 * - Cards 0-1: No meters visible (learn swipe)
 * - Card 2: First meter revealed (authority)
 * - Card 3: populace + treasury revealed
 * - Card 4: military + stability revealed (all 5 visible)
 * - Card 6: Trait ceremony
 * - Card 7: Court tab unlocked
 * - Completion: Map tab unlocked, origin complete
 *
 * @see SOV_PRD_08_ONBOARDING -- full onboarding specification
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

import type { Card, Direction, TextContext, MeterDelta, DefiningTrait } from '../../types';
import { METER_NAMES, type MeterName, type MeterEffects } from '../../types';
import {
  useGameStore,
  useMeterStore,
  useMemoryStore,
  useUIStore,
  useCourtStore,
  useCardStore,
} from '../../stores';
import {
  getOriginCard,
  advanceOnboarding,
  createInitialOnboardingState,
  type OnboardingState,
} from '../../services/game/onboarding-engine';
import { resolveText } from '../../services/game/text-resolver';
import { SwipeCard } from '../cards/SwipeCard';
import { WorldNarration } from '../cards/WorldNarration';
import { ImpactSummary } from '../cards/ImpactSummary';
import { TraitCeremony } from '../overlays/TraitCeremony';
import { UnlockOverlay } from '../overlays/UnlockOverlay';
import { Bridge } from '../overlays/Bridge';
import { colors } from '../../theme/colors';

// ---------------------------------------------------------------------------
// Phase States
// ---------------------------------------------------------------------------

type OriginStep =
  | 'bridge'        // transition overlay between cards
  | 'narration'     // world event narration (card 5)
  | 'card'          // showing SwipeCard for current card
  | 'impact'        // showing ImpactSummary after commit
  | 'trait'         // TraitCeremony overlay
  | 'unlock'        // UnlockOverlay
  | 'complete';     // origin done, navigating away

// ---------------------------------------------------------------------------
// Bridge text between cards
// ---------------------------------------------------------------------------

const BRIDGE_TEXT: Record<number, string | undefined> = {
  1: undefined,                  // No bridge before card 0
  2: 'A memory surfaces...',
  3: 'The next morning...',
  4: 'You remember...',
  5: 'That night...',
  6: undefined,                  // Narration flows into reaction
  7: 'Word spreads...',
  8: 'Your first week begins...',
};

// ---------------------------------------------------------------------------
// Tab unlock data
// ---------------------------------------------------------------------------

const TAB_UNLOCKS: Record<number, { tabName: string; icon: string; tabId: string }> = {
  7: { tabName: 'Court', icon: '\uD83D\uDC51', tabId: 'court' },
  8: { tabName: 'Map', icon: '\uD83D\uDDFA\uFE0F', tabId: 'map' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OriginPhase() {
  // Stores
  const gameStore = useGameStore();
  const meterStore = useMeterStore();
  const memoryStore = useMemoryStore();
  const uiStore = useUIStore();
  const courtStore = useCourtStore();

  // Local origin state machine
  const [onboarding, setOnboarding] = useState<OnboardingState>(
    createInitialOnboardingState,
  );
  const [step, setStep] = useState<OriginStep>('card');
  const [lastDirection, setLastDirection] = useState<Direction | null>(null);
  const [lastLabel, setLastLabel] = useState('');
  const [lastNarrative, setLastNarrative] = useState<string | undefined>(undefined);
  const [lastDeltas, setLastDeltas] = useState<MeterDelta[]>([]);
  const [pendingTrait, setPendingTrait] = useState<DefiningTrait | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<{
    tabName: string;
    icon: string;
    tabId: string;
  } | null>(null);

  // Track whether we need a post-impact unlock or trait reveal
  const postImpactActions = useRef<Array<'trait' | 'unlock'>>([]);

  // Current origin card
  const currentCard = useMemo(
    () => getOriginCard(onboarding.cardIndex),
    [onboarding.cardIndex],
  );

  // Build TextContext from current stores
  const textContext: TextContext = useMemo(() => {
    const meters: Record<string, number> = { ...meterStore.meters };
    return {
      memory: {
        flags: memoryStore.getFlags(),
        choices: memoryStore.choices,
        witnessed: memoryStore.getWitnessed(),
        cardsPlayed: memoryStore.getCardsPlayed(),
      },
      npcs: courtStore.npcs,
      trait: gameStore.trait,
      week: gameStore.week,
      act: gameStore.act,
      corruption: gameStore.corruption,
      meters,
    };
  }, [
    meterStore.meters,
    memoryStore._flags,
    memoryStore.choices,
    courtStore.npcs,
    gameStore.trait,
    gameStore.week,
    gameStore.corruption,
  ]);

  // ── Handlers ────────────────────────────────────────────────────────────

  /**
   * Handle swipe commit on current card. Apply effects, show impact.
   */
  const handleCommit = useCallback(
    (direction: Direction) => {
      if (!currentCard) return;

      const option = currentCard[direction];
      if (!option) return;

      const label = resolveText(option.label, textContext);
      const narr = option.narr
        ? resolveText(option.narr, textContext)
        : undefined;

      // Apply meter effects
      const effects = option.meters;
      const deltas: MeterDelta[] = [];
      if (effects) {
        for (const name of METER_NAMES) {
          const val = effects[name as keyof MeterEffects];
          if (val != null && val !== 0) {
            deltas.push({ meter: name, amount: val });
          }
        }
        meterStore.applyMeters(effects);
      }

      // Apply corruption
      if (option.corrupt) {
        gameStore.addCorruption(option.corrupt);
      }

      // Set flags
      if (option.setFlags) {
        memoryStore.addFlags(...option.setFlags);
      }
      if (currentCard.setFlags) {
        const flags =
          typeof currentCard.setFlags === 'function'
            ? currentCard.setFlags(textContext)
            : currentCard.setFlags;
        memoryStore.addFlags(...flags);
      }

      // Record choice
      memoryStore.addChoice({
        cardId: currentCard.id,
        direction,
        label,
        week: gameStore.week,
      });
      memoryStore.markCardPlayed(currentCard.id);
      gameStore.incrementCardsPlayed();

      // Handle trait assignment (card 6)
      if (option.trait) {
        gameStore.setTrait(option.trait);
        setPendingTrait(option.trait);
        postImpactActions.current.push('trait');
      }

      // Handle NPC recruitment
      if (option.npcRecruit) {
        const { name } = option.npcRecruit;
        courtStore.recruitNPC(name);
      }

      // Handle NPC loyalty effect
      if (option.npcEffect) {
        courtStore.updateLoyalty(option.npcEffect.name, option.npcEffect.delta);
      }

      // Queue follow-up if any
      if (option.followUp) {
        useCardStore.getState().queueFollowUp(option.followUp);
      }

      // Save state for ImpactSummary
      setLastDirection(direction);
      setLastLabel(label);
      setLastNarrative(narr);
      setLastDeltas(deltas);

      // Check if current card triggers a tab unlock
      const nextIndex = onboarding.cardIndex + 1;
      const unlock = TAB_UNLOCKS[nextIndex];
      if (unlock) {
        setPendingUnlock(unlock);
        postImpactActions.current.push('unlock');
      }

      // Show impact summary
      setStep('impact');
    },
    [currentCard, textContext, onboarding.cardIndex],
  );

  /**
   * Handle world event narration complete -> show reaction card (card 6).
   */
  const handleNarrationReaction = useCallback(() => {
    // Apply autoMeters from the world event card
    if (currentCard?.autoMeters) {
      meterStore.applyMeters(currentCard.autoMeters);
    }
    memoryStore.markCardPlayed(currentCard?.id ?? '');

    // Advance onboarding to next card (the reaction card)
    const nextState = advanceOnboarding(onboarding);
    setOnboarding(nextState);

    // Show the reaction card
    setStep('card');
  }, [currentCard, onboarding]);

  /**
   * Handle impact summary advance -> check for trait/unlock reveals, then next card.
   */
  const handleImpactAdvance = useCallback(() => {
    const nextAction = postImpactActions.current.shift();

    if (nextAction === 'trait' && pendingTrait) {
      setStep('trait');
      return;
    }

    if (nextAction === 'unlock' && pendingUnlock) {
      uiStore.unlockTab(pendingUnlock.tabId);
      setStep('unlock');
      return;
    }

    // No more post-impact actions, advance to next card
    advanceToNextCard();
  }, [pendingTrait, pendingUnlock]);

  /**
   * Handle trait ceremony dismiss -> check for remaining post-impact actions.
   */
  const handleTraitDismiss = useCallback(() => {
    setPendingTrait(null);
    uiStore.setShowTraitCeremony(false);

    const nextAction = postImpactActions.current.shift();
    if (nextAction === 'unlock' && pendingUnlock) {
      uiStore.unlockTab(pendingUnlock.tabId);
      setStep('unlock');
      return;
    }

    advanceToNextCard();
  }, [pendingUnlock]);

  /**
   * Handle unlock overlay dismiss -> advance to next card.
   */
  const handleUnlockDismiss = useCallback(() => {
    setPendingUnlock(null);
    uiStore.setShowUnlock(null);
    advanceToNextCard();
  }, []);

  /**
   * Advance the onboarding state machine and show the next card
   * (with a bridge transition).
   */
  const advanceToNextCard = useCallback(() => {
    const nextState = advanceOnboarding(onboarding);
    setOnboarding(nextState);

    if (nextState.complete) {
      // Origin complete -- unlock map tab and navigate
      uiStore.unlockTab('map');
      const mapUnlock = TAB_UNLOCKS[8];
      if (mapUnlock) {
        setPendingUnlock(mapUnlock);
        setStep('unlock');
        return;
      }
      finishOrigin();
      return;
    }

    // Show bridge transition before next card (except card 5->6 narration flow)
    const nextCard = getOriginCard(nextState.cardIndex);
    if (nextCard?.worldEvent) {
      // World event card: show narration instead of bridge -> swipe
      setStep('bridge');
    } else {
      setStep('bridge');
    }
  }, [onboarding]);

  /**
   * Handle bridge transition complete -> show the next card.
   */
  const handleBridgeComplete = useCallback(() => {
    const card = getOriginCard(onboarding.cardIndex);
    if (card?.worldEvent) {
      setStep('narration');
    } else {
      setStep('card');
    }
  }, [onboarding.cardIndex]);

  /**
   * Finish the origin phase: mark complete, set game phase, navigate.
   */
  const finishOrigin = useCallback(() => {
    setStep('complete');
    gameStore.completeOrigin();
    uiStore.setActiveTab('cards');
    // Navigation happens via the parent cards.tsx detecting originComplete
  }, []);

  /**
   * Handle the final unlock dismiss (map unlock at completion).
   */
  const handleFinalUnlockDismiss = useCallback(() => {
    setPendingUnlock(null);
    finishOrigin();
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  if (!currentCard && step !== 'complete' && step !== 'unlock') {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Bridge transition */}
      {step === 'bridge' && (
        <Bridge
          text={BRIDGE_TEXT[onboarding.cardIndex + 1]}
          onComplete={handleBridgeComplete}
        />
      )}

      {/* World event narration (card 5) */}
      {step === 'narration' && currentCard && (
        <WorldNarration
          card={currentCard}
          textContext={textContext}
          onReaction={handleNarrationReaction}
        />
      )}

      {/* SwipeCard for current origin card */}
      {step === 'card' && currentCard && (
        <SwipeCard
          card={currentCard}
          onCommit={handleCommit}
          textContext={textContext}
        />
      )}

      {/* ImpactSummary after commit */}
      {step === 'impact' && lastDirection && (
        <ImpactSummary
          direction={lastDirection}
          label={lastLabel}
          narrative={lastNarrative}
          meterDeltas={lastDeltas}
          onAdvance={handleImpactAdvance}
        />
      )}

      {/* Trait Ceremony overlay (after card 6) */}
      {step === 'trait' && pendingTrait && (
        <TraitCeremony trait={pendingTrait} onDismiss={handleTraitDismiss} />
      )}

      {/* Unlock overlay (court at card 7, map at completion) */}
      {step === 'unlock' && pendingUnlock && (
        <UnlockOverlay
          tabName={pendingUnlock.tabName}
          icon={pendingUnlock.icon}
          onDismiss={
            onboarding.complete ? handleFinalUnlockDismiss : handleUnlockDismiss
          }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OriginPhase;
