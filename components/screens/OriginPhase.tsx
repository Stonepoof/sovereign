// ─── OriginPhase ─────────────────────────────────────────────────────────────
// 8-card origin orchestrator with progressive disclosure.
// Each origin card defines a piece of the ruler's backstory.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { SwipeCard } from '../cards/SwipeCard';
import { TraitCeremony } from '../overlays/TraitCeremony';
import { Bridge } from '../overlays/Bridge';
import { useGameStore } from '../../stores/gameStore';
import type { GameCard, SwipeDirection, Trait, MeterDelta, MeterState, GameCardOption } from '../../types';

interface OriginPhaseProps {
  onComplete: () => void;
}

// ─── Origin cards (8 steps) ──────────────────────────────────────────────────
const ORIGIN_CARDS: GameCard[] = [
  {
    id: 'origin-1',
    type: 'origin',
    title: 'Your Lineage',
    narrative: 'The previous ruler lies dead. How did you come to power?',
    options: [
      { direction: 'left', label: 'By right of blood', effects: [{ meter: 'authority', delta: 10 }] },
      { direction: 'right', label: 'Through a coup', effects: [{ meter: 'military', delta: 10 }] },
    ],
  },
  {
    id: 'origin-2',
    type: 'origin',
    title: 'First Act',
    narrative: 'The court awaits your first decree. What do you prioritize?',
    options: [
      { direction: 'left', label: 'Feed the hungry', effects: [{ meter: 'populace', delta: 10 }, { meter: 'treasury', delta: -5 }] },
      { direction: 'right', label: 'Strengthen the army', effects: [{ meter: 'military', delta: 10 }, { meter: 'populace', delta: -5 }] },
    ],
  },
  {
    id: 'origin-3',
    type: 'origin',
    title: 'The Advisor',
    narrative: 'A trusted voice offers counsel. Whose advice do you favor?',
    options: [
      { direction: 'left', label: 'The scholar', effects: [{ meter: 'stability', delta: 8 }] },
      { direction: 'right', label: 'The merchant', effects: [{ meter: 'treasury', delta: 8 }] },
    ],
  },
  {
    id: 'origin-4',
    type: 'origin',
    title: 'Border Dispute',
    narrative: 'Neighboring lands challenge your claim to a fertile valley.',
    options: [
      { direction: 'left', label: 'Negotiate peace', effects: [{ meter: 'stability', delta: 8 }, { meter: 'military', delta: -5 }] },
      { direction: 'right', label: 'March to war', effects: [{ meter: 'military', delta: 8 }, { meter: 'populace', delta: -5 }] },
    ],
  },
  {
    id: 'origin-5',
    type: 'origin',
    title: 'Faith or Reason',
    narrative: 'The temple demands tithes. The university asks for funding.',
    options: [
      { direction: 'left', label: 'Fund the temple', effects: [{ meter: 'populace', delta: 5 }, { meter: 'treasury', delta: -5 }] },
      { direction: 'right', label: 'Fund the university', effects: [{ meter: 'stability', delta: 5 }, { meter: 'treasury', delta: -5 }] },
    ],
  },
  {
    id: 'origin-6',
    type: 'origin',
    title: 'Justice',
    narrative: 'A noble is caught stealing from the crown. What is their fate?',
    options: [
      { direction: 'left', label: 'Show mercy', effects: [{ meter: 'populace', delta: 5 }, { meter: 'authority', delta: -5 }] },
      { direction: 'right', label: 'Swift punishment', effects: [{ meter: 'authority', delta: 5 }, { meter: 'populace', delta: -5 }] },
    ],
  },
  {
    id: 'origin-7',
    type: 'origin',
    title: 'The Feast',
    narrative: 'A grand celebration is proposed to mark your coronation.',
    options: [
      { direction: 'left', label: 'Lavish feast for all', effects: [{ meter: 'populace', delta: 8 }, { meter: 'treasury', delta: -8 }] },
      { direction: 'right', label: 'Modest ceremony', effects: [{ meter: 'treasury', delta: 5 }, { meter: 'populace', delta: -3 }] },
    ],
  },
  {
    id: 'origin-8',
    type: 'origin',
    title: 'Your Creed',
    narrative: 'As the crown settles on your head, what principle guides your reign?',
    options: [
      { direction: 'left', label: 'Compassion above all', effects: [{ meter: 'populace', delta: 5 }] },
      { direction: 'right', label: 'Strength above all', effects: [{ meter: 'authority', delta: 5 }] },
    ],
  },
];

// ─── Trait determination ─────────────────────────────────────────────────────
function determineTrait(meters: MeterState): Trait {
  const sorted = Object.entries(meters as Record<string, number>).sort(([, a], [, b]) => b - a);
  const [topMeter] = sorted[0];

  const traits: Record<string, Trait> = {
    authority: { id: 'iron-will', name: 'Iron Will', description: 'Your word is law, and few dare question it.' },
    populace: { id: 'peoples-champion', name: "People's Champion", description: 'The common folk see you as their savior.' },
    treasury: { id: 'golden-touch', name: 'Golden Touch', description: 'Wealth flows where you command.' },
    military: { id: 'war-sovereign', name: 'War Sovereign', description: 'Your armies march with unshakable loyalty.' },
    stability: { id: 'steady-hand', name: 'Steady Hand', description: 'In chaos, you are the calm.' },
  };

  return traits[topMeter] ?? traits.stability;
}

export function OriginPhase({ onComplete }: OriginPhaseProps) {
  const [step, setStep] = useState(0);
  const [showTrait, setShowTrait] = useState(false);
  const [showBridge, setShowBridge] = useState(false);
  const [trait, setTraitState] = useState<Trait | null>(null);

  const { applyMeterDeltas, setTrait, setPhase, meters } = useGameStore();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / ORIGIN_CARDS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step, progressAnim]);

  const handleSwipe = (direction: SwipeDirection) => {
    const card = ORIGIN_CARDS[step];
    if (!card) return;

    const option = card.options.find((o: GameCardOption) => o.direction === direction);
    if (!option) return;

    applyMeterDeltas(option.effects);

    if (step < ORIGIN_CARDS.length - 1) {
      setStep(step + 1);
    } else {
      // Origin complete — determine trait
      const determinedTrait = determineTrait(meters);
      setTraitState(determinedTrait);
      setTrait(determinedTrait);
      setShowTrait(true);
    }
  };

  const handleTraitDismiss = () => {
    setShowTrait(false);
    setShowBridge(true);
  };

  const handleBridgeComplete = () => {
    setShowBridge(false);
    setPhase('playing');
    onComplete();
  };

  const currentCard = ORIGIN_CARDS[step];

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>ORIGIN — {step + 1} of {ORIGIN_CARDS.length}</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Current card */}
      <View style={styles.cardContainer}>
        {currentCard && (
          <SwipeCard card={currentCard} onSwipe={handleSwipe} />
        )}
      </View>

      {/* Trait ceremony overlay */}
      {showTrait && trait && (
        <TraitCeremony trait={trait} onDismiss={handleTraitDismiss} />
      )}

      {/* Bridge transition */}
      {showBridge && (
        <Bridge text="Your reign begins..." onComplete={handleBridgeComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.goldDim,
    letterSpacing: 2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
