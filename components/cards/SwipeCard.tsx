/**
 * Sovereign -- SwipeCard Component
 *
 * The core game interaction component. Renders a card with agency badge,
 * portrait, title, body text, and directional options. The entire card
 * is swipeable in up to 4 directions to make decisions.
 *
 * Uses useSwipeGesture for pan interaction via PanResponder and
 * standard Animated.View for the physics-driven UI.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 3 -- card layout and swipe mechanics
 */

import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

import type { Card, Direction, TextContext, AgencyType, MeterEffects } from '../../types';
import { AGENCY_COLORS } from '../../types';
import { resolveText, resolveCard } from '../../services/game/text-resolver';
import type { ResolvedCard, ResolvedOption } from '../../services/game/text-resolver';
import { useSwipeGesture, DIRECTION_ARROWS } from '../../hooks/useSwipeGesture';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, cardSize } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Colors for each swipe direction (used for glow and highlights). */
const DIRECTION_COLORS: Record<Direction, string> = {
  up: colors.swipeUp,
  down: colors.swipeDown,
  left: colors.swipeLeft,
  right: colors.swipeRight,
};

/** Ordered directions for rendering the options row. */
const DIRECTION_ORDER: Direction[] = ['left', 'up', 'down', 'right'];

/** Meter display icons (emoji). */
const METER_ICONS: Record<string, string> = {
  authority: '\u2694\uFE0F',
  populace: '\uD83D\uDC65',
  treasury: '\uD83D\uDCB0',
  military: '\uD83D\uDEE1\uFE0F',
  stability: '\u2696\uFE0F',
};

/** Meter display colors. */
const METER_COLORS: Record<string, string> = {
  authority: colors.authority,
  populace: colors.populace,
  treasury: colors.treasury,
  military: colors.military,
  stability: colors.stability,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SwipeCardProps {
  /** The card data to render. */
  card: Card;
  /** Called when the player commits a swipe in a direction. */
  onCommit: (direction: Direction) => void;
  /** Text context for resolving TextFunction fields. */
  textContext: TextContext;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Agency badge pill (top-left). */
function AgencyBadge({ agency }: { agency: AgencyType }) {
  const badgeColor = AGENCY_COLORS[agency];
  const label = agency.charAt(0).toUpperCase() + agency.slice(1);

  return (
    <View style={[styles.agencyBadge, { backgroundColor: badgeColor + '33' }]}>
      <Text style={[styles.agencyBadgeText, { color: badgeColor }]}>{label}</Text>
    </View>
  );
}

/** Emoji portrait with subtle glow background. */
function Portrait({ emoji, agency }: { emoji: string; agency: AgencyType }) {
  const glowColor = AGENCY_COLORS[agency] + '30';

  return (
    <View style={[styles.portraitContainer, { backgroundColor: glowColor }]}>
      <Text style={styles.portraitEmoji}>{emoji}</Text>
    </View>
  );
}

/** Single option row item showing direction, label, and meter effect dots. */
function OptionItem({
  option,
  direction,
  meters,
  isActive,
}: {
  option: ResolvedOption;
  direction: Direction;
  meters: MeterEffects | undefined;
  isActive: boolean;
}) {
  const dirColor = DIRECTION_COLORS[direction];
  const arrow = DIRECTION_ARROWS[direction];

  // Collect meter effect dots
  const meterDots = useMemo(() => {
    if (!meters) return [];
    return Object.entries(meters)
      .filter(([, value]) => value !== 0 && value !== undefined)
      .map(([meter, value]) => ({
        key: meter,
        color: METER_COLORS[meter] || colors.textMuted,
        positive: (value as number) > 0,
      }));
  }, [meters]);

  return (
    <View
      style={[
        styles.optionItem,
        isActive && { backgroundColor: dirColor + '25', borderColor: dirColor },
      ]}
    >
      <Text style={[styles.optionArrow, isActive && { color: dirColor }]}>{arrow}</Text>
      <View style={styles.optionContent}>
        <Text
          style={[styles.optionLabel, isActive && { color: dirColor }]}
          numberOfLines={1}
        >
          {option.label}
        </Text>
        {meterDots.length > 0 && (
          <View style={styles.meterDots}>
            {meterDots.map((dot) => (
              <View
                key={dot.key}
                style={[styles.meterDot, { backgroundColor: dot.color }]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

/** Swipe preview overlay showing meter effects during gesture. */
function SwipePreview({
  direction,
  meters,
  visible,
}: {
  direction: Direction | null;
  meters: MeterEffects | undefined;
  visible: boolean;
}) {
  if (!visible || !direction || !meters) {
    return null;
  }

  const directionColor = DIRECTION_COLORS[direction];
  const arrow = DIRECTION_ARROWS[direction];

  // Get meter effects for this direction
  const meterEffects = useMemo(() => {
    return Object.entries(meters)
      .filter(([, value]) => value !== 0 && value !== undefined)
      .map(([meter, value]) => ({
        key: meter,
        icon: METER_ICONS[meter] || '⭐',
        color: METER_COLORS[meter] || colors.textMuted,
        value: value as number,
      }));
  }, [meters]);

  if (meterEffects.length === 0) {
    return null;
  }

  return (
    <View style={styles.previewOverlay}>
      <View style={[styles.previewContainer, { borderColor: directionColor + '80' }]}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewArrow, { color: directionColor }]}>{arrow}</Text>
          <Text style={[styles.previewTitle, { color: directionColor }]}>Effects</Text>
        </View>
        <View style={styles.previewEffects}>
          {meterEffects.map((effect) => (
            <View key={effect.key} style={styles.previewEffect}>
              <Text style={styles.previewMeterIcon}>{effect.icon}</Text>
              <Text
                style={[
                  styles.previewMeterValue,
                  {
                    color: effect.value > 0 ? colors.success : colors.error,
                  },
                ]}
              >
                {effect.value > 0 ? '+' : ''}
                {effect.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function SwipeCard({ card, onCommit, textContext }: SwipeCardProps) {
  // Resolve all text functions to plain strings
  const resolved: ResolvedCard = useMemo(
    () => resolveCard(card, textContext),
    [card, textContext],
  );

  // Map directions to their card options (original, for meter data)
  const optionMap = useMemo(
    () => ({
      left: card.left,
      right: card.right,
      up: card.up,
      down: card.down,
    }),
    [card],
  );

  // Map directions to resolved options
  const resolvedOptionMap = useMemo(
    () => ({
      left: resolved.left,
      right: resolved.right,
      up: resolved.up,
      down: resolved.down,
    }),
    [resolved],
  );

  // Available directions (those with options defined)
  const availableDirections = useMemo(() => {
    const dirs: Direction[] = [];
    if (resolved.left) dirs.push('left');
    if (resolved.right) dirs.push('right');
    if (resolved.up) dirs.push('up');
    if (resolved.down) dirs.push('down');
    return dirs;
  }, [resolved]);

  const isOptionAvailable = useCallback(
    (direction: Direction): boolean => {
      return resolvedOptionMap[direction] != null;
    },
    [resolvedOptionMap],
  );

  // Swipe gesture hook
  const { panResponder, animatedStyle, activeDirectionState } = useSwipeGesture({
    onCommit,
    isOptionAvailable,
    enabled: true,
  });

  // Get current swipe direction and corresponding meters
  const currentDirection = activeDirectionState;
  const currentMeters = currentDirection ? optionMap[currentDirection]?.meters : undefined;
  const isSwipeActive = currentDirection !== null;

  return (
    <Animated.View
      style={[styles.cardContainer, animatedStyle]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.card]}>
        {/* Agency badge */}
        <AgencyBadge agency={card.agency} />

        {/* Portrait */}
        <Portrait emoji={resolved.portrait} agency={card.agency} />

        {/* NPC name (if present) */}
        {resolved.npc && <Text style={styles.npcName}>{resolved.npc}</Text>}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {resolved.title}
        </Text>

        {/* Body text */}
        <Text style={styles.bodyText} numberOfLines={4}>
          {resolved.text}
        </Text>

        {/* Options row */}
        <View style={styles.optionsContainer}>
          {DIRECTION_ORDER.map((dir) => {
            const resolvedOpt = resolvedOptionMap[dir];
            if (!resolvedOpt) return null;

            const originalOpt = optionMap[dir];

            return (
              <OptionItem
                key={dir}
                option={resolvedOpt}
                direction={dir}
                meters={originalOpt?.meters}
                isActive={false}
              />
            );
          })}
        </View>
      </View>

      {/* Swipe Preview Overlay */}
      <SwipePreview
        direction={currentDirection}
        meters={currentMeters}
        visible={isSwipeActive}
      />
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: cardSize.width,
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    overflow: 'hidden',
    // Elevation for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Agency badge
  agencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
  },
  agencyBadgeText: {
    ...typography.label,
    fontSize: 10,
  },

  // Portrait
  portraitContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  portraitEmoji: {
    fontSize: 40,
  },

  // NPC name
  npcName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  // Title
  title: {
    ...typography.h3,
    color: colors.textAccent,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  // Body text
  bodyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Options
  optionsContainer: {
    gap: spacing.xs,
    marginTop: 'auto' as any,
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  optionArrow: {
    fontSize: 16,
    color: colors.textMuted,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },

  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  optionLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 12,
  },

  meterDots: {
    flexDirection: 'row',
    gap: 3,
    marginLeft: spacing.xs,
  },

  meterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Swipe Preview Overlay
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.xl,
  },

  previewContainer: {
    backgroundColor: colors.surface + 'CC', // Semi-transparent
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    minWidth: 200,
    alignItems: 'center',
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  previewArrow: {
    fontSize: 24,
    marginRight: spacing.sm,
  },

  previewTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: 'bold',
  },

  previewEffects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },

  previewEffect: {
    alignItems: 'center',
    minWidth: 50,
  },

  previewMeterIcon: {
    fontSize: 20,
    marginBottom: spacing.xxs,
  },

  previewMeterValue: {
    ...typography.label,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SwipeCard;
