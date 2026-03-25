/**
 * Sovereign -- Cards Tab (Core Game Loop)
 *
 * Polymorphic content area based on game state:
 * - Default: SwipeCard for current card
 * - wep="narration": WorldNarration component
 * - wep="reaction": SwipeCard with reaction styling
 * - Impact showing: ImpactSummary
 * - Conversation active: ConversationView
 * - Dice rolling: DiceOverlay on top
 * - No card: "Drawing next card..." loading state
 *
 * Calls selectNextCard when no card is active and no overlay is showing.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { Card, InterludeCard, ConversationCard } from '../../types';
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
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

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

export default function CardsScreen() {
  const currentCard = useCardStore((s) => s.currentCard);
  const impact = useCardStore((s) => s.impact);
  const setCurrentCard = useCardStore((s) => s.setCurrentCard);
  const cardQueue = useCardStore((s) => s.cardQueue);
  const dequeueFollowUp = useCardStore((s) => s.dequeueFollowUp);

  const wep = useUIStore((s) => s.wep);
  const showDice = useUIStore((s) => s.showDice);

  const conversationActive = useConversationStore((s) => s.active);

  const week = useGameStore((s) => s.week);
  const act = useGameStore((s) => s.act);
  const trait = useGameStore((s) => s.trait);
  const corruption = useGameStore((s) => s.corruption);
  const cardsPlayed = useGameStore((s) => s.cardsPlayed);

  const meters = useMeterStore((s) => s.meters);
  const npcs = useCourtStore((s) => s.npcs);
  const districts = useDistrictStore((s) => s.districts);
  const getFlags = useMemoryStore((s) => s.getFlags);
  const getCardsPlayed = useMemoryStore((s) => s.getCardsPlayed);

  // Auto-select next card when none is active
  useEffect(() => {
    if (currentCard || impact || conversationActive) return;

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
    if (nextCard) {
      setCurrentCard(nextCard);
    }
  }, [currentCard, impact, conversationActive]);

  // Render based on game state
  const renderContent = () => {
    // Conversation active
    if (conversationActive) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>💬</Text>
          <Text style={styles.placeholderTitle}>Conversation</Text>
          <Text style={styles.placeholderText}>
            ConversationView component renders here
          </Text>
        </View>
      );
    }

    // Impact summary showing
    if (impact) {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📊</Text>
          <Text style={styles.placeholderTitle}>Impact Summary</Text>
          <Text style={styles.placeholderText}>
            {impact.choiceLabel} — {impact.narrative}
          </Text>
          {impact.meterDeltas.map((d, i) => (
            <Text key={i} style={styles.deltaText}>
              {d.meter}: {d.amount > 0 ? '+' : ''}{d.amount}
            </Text>
          ))}
        </View>
      );
    }

    // No card — loading state
    if (!currentCard) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Drawing next card...</Text>
        </View>
      );
    }

    // World event narration phase
    if (wep === 'narration') {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🌍</Text>
          <Text style={styles.placeholderTitle}>World Event</Text>
          <Text style={styles.placeholderText}>
            WorldNarration component renders here
          </Text>
          <Text style={styles.cardInfo}>
            {getCardTitle(currentCard)}
          </Text>
        </View>
      );
    }

    // World event reaction phase
    if (wep === 'reaction') {
      return (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>⚡</Text>
          <Text style={styles.placeholderTitle}>Your Response</Text>
          <Text style={styles.placeholderText}>
            SwipeCard (reaction styling) renders here
          </Text>
          <Text style={styles.cardInfo}>
            {getCardTitle(currentCard)}
          </Text>
        </View>
      );
    }

    // Default: SwipeCard for current card
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderEmoji}>
          {'portrait' in currentCard ? currentCard.portrait : '🃏'}
        </Text>
        <Text style={styles.placeholderTitle}>
          {getCardTitle(currentCard)}
        </Text>
        <Text style={styles.placeholderText}>
          SwipeCard component renders here
        </Text>
        <Text style={styles.agencyBadge}>
          {currentCard.agency.toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      {/* Dice overlay on top when rolling */}
      {showDice && (
        <View style={styles.diceOverlay}>
          <Text style={styles.placeholderEmoji}>🎲</Text>
          <Text style={styles.placeholderTitle}>Dice Roll</Text>
          <Text style={styles.placeholderText}>
            DiceOverlay component renders here
          </Text>
        </View>
      )}
    </View>
  );
}

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
  cardInfo: {
    ...typography.bodySmall,
    color: colors.gold,
    marginTop: spacing.sm,
  },
  agencyBadge: {
    ...typography.label,
    color: colors.gold,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  deltaText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  diceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
});
