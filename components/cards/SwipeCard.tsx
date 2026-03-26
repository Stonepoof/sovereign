// ─── SwipeCard ───────────────────────────────────────────────────────────────
// Main agency card with PanResponder-based swiping.
// Agency badge, portrait placeholder, gold title, option arrows + labels + meter dots.

import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import type { GameCard, SwipeDirection, MeterKey, GameCardOption, MeterDelta } from '../../types';

interface SwipeCardProps {
  card: GameCard;
  onSwipe: (direction: SwipeDirection) => void;
}

const DIRECTION_ARROWS: Record<SwipeDirection, string> = {
  left: '←',
  right: '→',
  up: '↑',
  down: '↓',
};

const METER_DOT_COLORS: Record<string, string> = {
  authority: colors.meter.authority,
  populace: colors.meter.populace,
  treasury: colors.meter.treasury,
  military: colors.meter.military,
  stability: colors.meter.stability,
};

export function SwipeCard({ card, onSwipe }: SwipeCardProps) {
  const enabledDirections = card.options.map((o: GameCardOption) => o.direction);
  const { pan, tilt, panResponder } = useSwipeGesture({
    onSwipe,
    enabledDirections,
  });

  const rotate = tilt.interpolate({
    inputRange: [-15, 15],
    outputRange: ['-15deg', '15deg'],
    extrapolate: 'clamp',
  });

  const agencyColor = card.agency ? (colors.agency as Record<string, string>)[card.agency] ?? colors.gold : colors.gold;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate },
          ],
        },
      ]}
    >
      {/* Agency badge */}
      {card.agency && (
        <View style={[styles.agencyBadge, { backgroundColor: agencyColor }]}>
          <Text style={styles.agencyText}>
            {card.agency.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Portrait placeholder */}
      <View style={styles.portraitContainer}>
        <View style={styles.portrait}>
          <Text style={styles.portraitEmoji}>👤</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{card.title}</Text>

      {/* Narrative */}
      <Text style={styles.narrative}>{card.narrative}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {card.options.map((option: GameCardOption) => (
          <View key={option.direction} style={styles.optionRow}>
            <Text style={[styles.arrow, { color: (colors.swipe as Record<string, string>)[option.direction] }]}>
              {DIRECTION_ARROWS[option.direction]}
            </Text>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <View style={styles.meterDots}>
              {option.effects.map((effect: MeterDelta, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.meterDot,
                    {
                      backgroundColor: METER_DOT_COLORS[effect.meter] ?? colors.textMuted,
                      opacity: effect.delta > 0 ? 1 : 0.5,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: Dimensions.get('window').width - 40,
    maxWidth: 380,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  agencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  agencyText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: '#000000',
    letterSpacing: 1,
  },
  portraitContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  portrait: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  portraitEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  narrative: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.6,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  arrow: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    width: 24,
    textAlign: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  meterDots: {
    flexDirection: 'row',
    gap: 4,
  },
  meterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
