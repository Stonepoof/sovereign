/**
 * Sovereign -- Interlude Component
 *
 * Auto-advancing dramatic irony card. Shows the player information their
 * character doesn't know, creating dramatic tension. No choices -- text
 * auto-advances after a duration scaled by word count.
 *
 * Timing: max(4000, 3000 + wordCount * 70) ms.
 * Player can tap to skip.
 *
 * Visual: italic text (16px, muted color), subtle fade in/out transitions,
 * small "INTERLUDE" label at top in gray.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY -- interlude card specification
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { InterludeCard, TextContext } from '../../types';
import { resolveText } from '../../services/game/text-resolver';
import { useAutoAdvance } from '../../hooks/useAutoAdvance';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface InterludeProps {
  card: InterludeCard;
  textContext: TextContext;
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Interlude({ card, textContext, onComplete }: InterludeProps) {
  const titleText = resolveText(card.title, textContext);
  const bodyText = resolveText(card.text, textContext);

  const { skip } = useAutoAdvance({
    text: bodyText,
    baseMs: 4000,
    perWordMs: 70,
    onAdvance: onComplete,
    enabled: true,
  });

  const handleTap = useCallback(() => {
    skip();
  }, [skip]);

  return (
    <Pressable style={styles.container} onPress={handleTap}>
      <Animated.View
        style={styles.content}
        entering={FadeIn.duration(600)}
        exiting={FadeOut.duration(400)}
      >
        {/* Interlude label */}
        <Text style={styles.label}>INTERLUDE</Text>

        {/* Title (optional) */}
        {titleText ? (
          <Text style={styles.title}>{titleText}</Text>
        ) : null}

        {/* Body text */}
        <Text style={styles.bodyText}>{bodyText}</Text>

        {/* Tap hint */}
        <Text style={styles.tapHint}>Tap to continue</Text>
      </Animated.View>
    </Pressable>
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
    paddingHorizontal: spacing.xxl,
  },

  content: {
    alignItems: 'center',
    gap: spacing.lg,
    maxWidth: 340,
  },

  label: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 3,
    fontSize: 10,
  },

  title: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  bodyText: {
    ...typography.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },

  tapHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xl,
    opacity: 0.5,
  },
});

export default Interlude;
