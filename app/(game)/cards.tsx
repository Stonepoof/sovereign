// ─── Cards Tab (THE Game Loop) ───────────────────────────────────────────────
// Orchestrates: origin → card selector → swipe → dice → impact → death → advance.
// This is the central gameplay screen.

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useGameStore } from '../../stores/gameStore';

// Card components
import { SwipeCard } from '../../components/cards/SwipeCard';
import { WorldNarration } from '../../components/cards/WorldNarration';
import { Interlude } from '../../components/cards/Interlude';
import { ImpactSummary } from '../../components/cards/ImpactSummary';
import { ConversationView } from '../../components/cards/ConversationView';
import { ConvoResult } from '../../components/cards/ConvoResult';

// Screens & overlays
import { OriginPhase } from '../../components/screens/OriginPhase';
import { DiceOverlay } from '../../components/dice/DiceOverlay';
import { Bridge } from '../../components/overlays/Bridge';

import type {
  SwipeDirection,
  GameCard,
  DiceResult,
  MeterDelta,
  ConvoResponse,
  CardSubPhase,
} from '../../types';

// ─── Mock card generator (placeholder for AI-generated cards) ────────────────
function generateMockCard(week: number): GameCard {
  const agencies = ['decree', 'diplomacy', 'commerce', 'military', 'espionage'] as const;
  const agency = agencies[week % agencies.length];

  return {
    id: `card-w${week}-${Date.now()}`,
    type: 'agency',
    agency,
    title: `Week ${week} Decision`,
    narrative: `As week ${week} unfolds, a matter of ${agency} demands your attention. The court watches your every move, weighing each decision against the last.`,
    options: [
      {
        direction: 'left',
        label: 'Take the cautious path',
        effects: [
          { meter: 'stability', delta: 5 },
          { meter: 'authority', delta: -3 },
        ],
      },
      {
        direction: 'right',
        label: 'Act with boldness',
        effects: [
          { meter: 'authority', delta: 5 },
          { meter: 'stability', delta: -3 },
        ],
      },
      {
        direction: 'up',
        label: 'Seek counsel first',
        effects: [
          { meter: 'populace', delta: 3 },
          { meter: 'treasury', delta: -2 },
        ],
        requiresDice: week % 3 === 0,
      },
    ],
  };
}

function generateNarration(week: number): GameCard {
  return {
    id: `narr-w${week}`,
    type: 'world_narration',
    title: 'The Kingdom Stirs',
    narrative: `Week ${week} dawns over the realm. The people go about their lives, unaware of the forces gathering in the shadows. Your choices echo through the corridors of power.`,
    options: [],
  };
}

function generateInterlude(): GameCard {
  return {
    id: `interlude-${Date.now()}`,
    type: 'interlude',
    title: 'A Moment of Quiet',
    narrative: 'Between the storms of governance, a rare moment of peace settles over the throne room. Outside, the city hums with life — merchants hawking wares, children laughing in the streets.',
    options: [],
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CardsScreen() {
  const router = useRouter();
  const {
    phase,
    subPhase,
    week,
    meters,
    rapport,
    currentCard,
    setPhase,
    setSubPhase,
    setCurrentCard,
    applyMeterDeltas,
    advanceWeek,
    setDeathNarrative,
    setRapport,
  } = useGameStore();

  // Local state for card flow
  const [lastSwipeDirection, setLastSwipeDirection] = useState<SwipeDirection>('right');
  const [lastChoiceLabel, setLastChoiceLabel] = useState('');
  const [lastMeterDeltas, setLastMeterDeltas] = useState<MeterDelta[]>([]);
  const [lastDiceResult, setLastDiceResult] = useState<DiceResult | null>(null);
  const [showDice, setShowDice] = useState(false);
  const [pendingEffects, setPendingEffects] = useState<MeterDelta[]>([]);
  const [showBridge, setShowBridge] = useState(false);

  // ─── Death check ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === 'death') {
      setDeathNarrative(
        'The balance of power has shifted irrevocably. Your reign could not withstand the pressures of governance.'
      );
      router.replace('/death');
    }
  }, [phase, router, setDeathNarrative]);

  // ─── Load initial card when entering playing phase ───────────────────────
  useEffect(() => {
    if (phase === 'playing' && !currentCard) {
      startNewWeek();
    }
  }, [phase, currentCard]);

  // ─── Card flow functions ─────────────────────────────────────────────────
  const startNewWeek = useCallback(() => {
    const narration = generateNarration(week);
    setCurrentCard(narration);
    setSubPhase('narration');
  }, [week, setCurrentCard, setSubPhase]);

  const handleNarrationRespond = useCallback(() => {
    const card = generateMockCard(week);
    setCurrentCard(card);
    setSubPhase('card');
  }, [week, setCurrentCard, setSubPhase]);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (!currentCard) return;
      const option = currentCard.options.find((o) => o.direction === direction);
      if (!option) return;

      setLastSwipeDirection(direction);
      setLastChoiceLabel(option.label);

      if (option.requiresDice) {
        setPendingEffects(option.effects);
        setShowDice(true);
        setSubPhase('dice');
      } else {
        // Apply effects directly
        applyMeterDeltas(option.effects);
        setLastMeterDeltas(option.effects);
        setLastDiceResult(null);
        setSubPhase('impact');
      }
    },
    [currentCard, applyMeterDeltas, setSubPhase]
  );

  const handleDiceResult = useCallback(
    (result: DiceResult) => {
      setShowDice(false);
      setLastDiceResult(result);

      if (result.success) {
        applyMeterDeltas(pendingEffects);
        setLastMeterDeltas(pendingEffects);
      } else {
        // Failure: reversed/reduced effects
        const failedEffects = pendingEffects.map((e) => ({
          meter: e.meter,
          delta: -Math.abs(e.delta),
        }));
        applyMeterDeltas(failedEffects);
        setLastMeterDeltas(failedEffects);
      }
      setPendingEffects([]);
      setSubPhase('impact');
    },
    [pendingEffects, applyMeterDeltas, setSubPhase]
  );

  const handleImpactAdvance = useCallback(() => {
    // Decide: interlude every 3 weeks, or advance
    if (week % 3 === 0) {
      const interlude = generateInterlude();
      setCurrentCard(interlude);
      setSubPhase('narration');
    } else {
      advanceWeek();
      setShowBridge(true);
    }
  }, [week, setCurrentCard, setSubPhase, advanceWeek]);

  const handleInterludeAdvance = useCallback(() => {
    advanceWeek();
    setShowBridge(true);
  }, [advanceWeek]);

  const handleBridgeComplete = useCallback(() => {
    setShowBridge(false);
    startNewWeek();
  }, [startNewWeek]);

  // Conversation handlers
  const handleConvoResponse = useCallback(
    (response: ConvoResponse) => {
      setRapport(rapport + response.rapportDelta);
      setSubPhase('convo_result');
    },
    [rapport, setRapport, setSubPhase]
  );

  const handleConvoResultDismiss = useCallback(() => {
    handleImpactAdvance();
  }, [handleImpactAdvance]);

  // ─── Render based on phase ───────────────────────────────────────────────
  if (phase === 'origin') {
    return <OriginPhase onComplete={() => {}} />;
  }

  return (
    <View style={styles.container}>
      {/* Bridge transition */}
      {showBridge && (
        <Bridge
          text={`Week ${week + 1}`}
          onComplete={handleBridgeComplete}
        />
      )}

      {/* Dice overlay */}
      {showDice && (
        <DiceOverlay threshold={4} onResult={handleDiceResult} />
      )}

      {/* Card content based on subPhase */}
      {!showBridge && !showDice && (
        <>
          {subPhase === 'narration' && currentCard?.type === 'world_narration' && (
            <WorldNarration
              narrative={currentCard.narrative}
              onRespond={handleNarrationRespond}
            />
          )}

          {subPhase === 'narration' && currentCard?.type === 'interlude' && (
            <Interlude
              narrative={currentCard.narrative}
              onAdvance={handleInterludeAdvance}
            />
          )}

          {subPhase === 'card' && currentCard && (
            <View style={styles.cardCenter}>
              <SwipeCard card={currentCard} onSwipe={handleSwipe} />
            </View>
          )}

          {subPhase === 'impact' && (
            <ImpactSummary
              direction={lastSwipeDirection}
              choiceLabel={lastChoiceLabel}
              narrative={`Your decision to "${lastChoiceLabel}" sends ripples through the realm.`}
              meterDeltas={lastMeterDeltas}
              diceResult={lastDiceResult}
              onAdvance={handleImpactAdvance}
            />
          )}

          {subPhase === 'conversation' && (
            <ConversationView
              npcName="Lord Aldric"
              beats={[
                { speaker: 'npc', text: 'Your Majesty, we must discuss the situation.' },
                { speaker: 'player', text: 'Speak freely, Aldric.' },
                { speaker: 'npc', text: 'The people grow restless. We need a plan.' },
              ]}
              responses={[
                { label: 'I hear their concerns.', rapportDelta: 5, loyaltyDelta: 3 },
                { label: 'They will endure.', rapportDelta: -3, loyaltyDelta: -2 },
                { label: 'What do you suggest?', rapportDelta: 2, loyaltyDelta: 5 },
              ]}
              rapport={rapport}
              onResponse={handleConvoResponse}
            />
          )}

          {subPhase === 'convo_result' && (
            <ConvoResult
              npcName="Lord Aldric"
              rapport={rapport}
              loyaltyChange={3}
              onDismiss={handleConvoResultDismiss}
            />
          )}

          {/* Empty state */}
          {!currentCard && phase === 'playing' && subPhase !== 'impact' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Preparing next event...</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
