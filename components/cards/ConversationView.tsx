/**
 * Sovereign -- ConversationView
 *
 * 3-beat visual novel encounter. Full-screen component that walks the player
 * through a ConversationCard's beats: NPC dialogue -> response options ->
 * reaction text -> next beat. After beat 3, shows ConvoResult.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import type { ConversationCard, TextContext, MeterEffects } from '../../types';
import { AGENCY_COLORS } from '../../types';
import { REACTION_DELAY_MS, MAX_RAPPORT } from '../../types/conversations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { ConvoResult } from './ConvoResult';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ConversationViewProps {
  card: ConversationCard;
  textContext: TextContext;
  onComplete: (result: { rapport: number; npcId: string }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConversationView({
  card,
  textContext,
  onComplete,
}: ConversationViewProps) {
  const [beatIndex, setBeatIndex] = useState(0);
  const [rapport, setRapport] = useState(0);
  const [showingReaction, setShowingReaction] = useState(false);
  const [reactionText, setReactionText] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [accumulatedMeters, setAccumulatedMeters] = useState<MeterEffects>({});

  const reactionOpacity = useRef(new Animated.Value(0)).current;
  const optionsOpacity = useRef(new Animated.Value(1)).current;

  const beat = card.beats[beatIndex];

  // Resolve speaker text (can be function of rapport)
  const speakerText =
    typeof beat?.speaker === 'function' ? beat.speaker(rapport) : beat?.speaker ?? '';

  const handleOptionPress = useCallback(
    (optionIndex: number) => {
      if (showingReaction || !beat) return;

      const option = beat.options[optionIndex];
      const newRapport = Math.min(rapport + option.rapport, MAX_RAPPORT);
      setRapport(newRapport);

      // Accumulate meter effects
      if (option.meters) {
        setAccumulatedMeters((prev) => {
          const next = { ...prev };
          for (const [key, val] of Object.entries(option.meters!)) {
            (next as any)[key] = ((next as any)[key] ?? 0) + val;
          }
          return next;
        });
      }

      // Resolve reaction text
      const resolved =
        typeof option.reaction === 'function'
          ? option.reaction(textContext)
          : option.reaction;
      setReactionText(resolved);
      setShowingReaction(true);

      // Fade out options, fade in reaction
      Animated.parallel([
        Animated.timing(optionsOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(reactionOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // After delay, advance to next beat or show result
      setTimeout(() => {
        if (beatIndex < 2) {
          setBeatIndex(beatIndex + 1);
          setShowingReaction(false);
          setReactionText('');
          reactionOpacity.setValue(0);
          optionsOpacity.setValue(1);
        } else {
          // Conversation complete
          setShowResult(true);
        }
      }, REACTION_DELAY_MS);
    },
    [beat, beatIndex, rapport, showingReaction, textContext, optionsOpacity, reactionOpacity],
  );

  // Result dismissed
  const handleResultDismiss = useCallback(() => {
    onComplete({ rapport, npcId: card.npcId });
  }, [rapport, card.npcId, onComplete]);

  // Calculate loyalty change for result
  const loyaltyChange = rapport * card.loyaltyBonus.perRapport;

  // ---------------------------------------------------------------------------
  // Result overlay
  // ---------------------------------------------------------------------------

  if (showResult) {
    return (
      <ConvoResult
        rapport={rapport}
        npcId={card.npcId}
        npcName={card.npcName}
        loyaltyChange={loyaltyChange}
        meterEffects={accumulatedMeters}
        onDismiss={handleResultDismiss}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Conversation UI
  // ---------------------------------------------------------------------------

  const rapportPercent = (rapport / MAX_RAPPORT) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CONVERSATION</Text>
          </View>
          <Text style={styles.beatCounter}>
            {beatIndex + 1}/3
          </Text>
        </View>
        <View style={styles.rapportBarContainer}>
          <View style={[styles.rapportBarFill, { width: `${rapportPercent}%` }]} />
        </View>
      </View>

      {/* Portrait Area */}
      <View style={styles.portraitArea}>
        <View style={styles.portraitGlow}>
          <Text style={styles.portraitEmoji}>{card.portrait}</Text>
        </View>
        <Text style={styles.npcName}>{card.npcName}</Text>
      </View>

      {/* Dialogue Box */}
      <View style={styles.dialogueBox}>
        <Text style={styles.speakerText}>{speakerText}</Text>
      </View>

      {/* Response Options / Reaction */}
      <View style={styles.responseArea}>
        {!showingReaction && (
          <Animated.View style={{ opacity: optionsOpacity }}>
            {beat?.options.map((option, idx) => {
              const rapportHint =
                option.rapport > 0 ? '+' : option.rapport === 0 ? '-' : '';
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionCard}
                  onPress={() => handleOptionPress(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text
                    style={[
                      styles.rapportHint,
                      {
                        color:
                          option.rapport > 0
                            ? colors.success
                            : option.rapport === 0
                            ? colors.textMuted
                            : colors.error,
                      },
                    ]}
                  >
                    {rapportHint === '+' ? '+' : rapportHint === '-' ? '-' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        {showingReaction && (
          <Animated.View style={[styles.reactionContainer, { opacity: reactionOpacity }]}>
            <Text style={styles.reactionText}>{reactionText}</Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: AGENCY_COLORS.conversation,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    ...typography.label,
    color: colors.background,
    fontSize: 10,
  },
  beatCounter: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  rapportBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    marginLeft: spacing.md,
    overflow: 'hidden',
  },
  rapportBarFill: {
    height: '100%',
    backgroundColor: AGENCY_COLORS.conversation,
    borderRadius: 2,
  },

  // Portrait
  portraitArea: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  portraitGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(201, 165, 90, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  portraitEmoji: {
    fontSize: 60,
  },
  npcName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Dialogue
  dialogueBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  speakerText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Response options
  responseArea: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  rapportHint: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Reaction
  reactionContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: AGENCY_COLORS.conversation,
  },
  reactionText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
