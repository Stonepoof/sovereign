/**
 * Sovereign -- WorldNarration Component
 *
 * 2-phase world event rendering. Phase 1 shows narrative text with a
 * word-by-word fade-in effect, then a gold-bordered "Respond" button.
 * Phase 2 triggers onReaction which sets wep='reaction' upstream so
 * a SwipeCard appears for the player's response.
 *
 * Visual: full dark background, centered narrative text (16px, light gray),
 * text fades in over ~2s, "Respond" button appears after text completes,
 * subtle vignette gradient at edges.
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY -- world event 2-phase rendering
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';

import type { Card, TextContext } from '../../types';
import { resolveText } from '../../services/game/text-resolver';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorldNarrationProps {
  card: Card;
  textContext: TextContext;
  onReaction: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Delay between each word appearing (ms). */
const WORD_DELAY_MS = 80;

/** Minimum time before the Respond button appears (ms). */
const MIN_BUTTON_DELAY_MS = 2000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WorldNarration({ card, textContext, onReaction }: WorldNarrationProps) {
  const narrationText = resolveText(card.narration ?? card.text, textContext);
  const words = narrationText.split(/\s+/).filter(Boolean);

  const [visibleWords, setVisibleWords] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Button fade-in
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Word-by-word reveal
  useEffect(() => {
    setVisibleWords(0);
    setShowButton(false);
    buttonOpacity.setValue(0);

    let wordIndex = 0;
    timerRef.current = setInterval(() => {
      wordIndex += 1;
      if (wordIndex >= words.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setVisibleWords(words.length);
        return;
      }
      setVisibleWords(wordIndex + 1);
    }, WORD_DELAY_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [narrationText]);

  // Show button after all words visible + minimum delay
  useEffect(() => {
    if (visibleWords < words.length) return;

    const totalTextTime = words.length * WORD_DELAY_MS;
    const remaining = Math.max(0, MIN_BUTTON_DELAY_MS - totalTextTime);

    const timer = setTimeout(() => {
      setShowButton(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, remaining);

    return () => clearTimeout(timer);
  }, [visibleWords, words.length]);

  const handleRespond = useCallback(() => {
    onReaction();
  }, [onReaction]);

  // Skip text animation on tap (show all words immediately)
  const handleTextTap = useCallback(() => {
    if (visibleWords < words.length) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setVisibleWords(words.length);
    }
  }, [visibleWords, words.length]);

  return (
    <View style={styles.container}>
      {/* Top vignette */}
      <View style={styles.vignetteTop} />

      {/* Narrative text area */}
      <Pressable style={styles.textArea} onPress={handleTextTap}>
        <Text style={styles.narrativeText}>
          {words.slice(0, visibleWords).join(' ')}
        </Text>
      </Pressable>

      {/* Bottom vignette */}
      <View style={styles.vignetteBottom} />

      {/* Respond button */}
      {showButton && (
        <Animated.View style={[styles.buttonWrapper, { opacity: buttonOpacity }]}>
          <Pressable style={styles.respondButton} onPress={handleRespond}>
            <Text style={styles.respondText}>Respond</Text>
          </Pressable>
        </Animated.View>
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
    paddingHorizontal: spacing.xxl,
  },

  vignetteTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    // Simulated gradient via shadow
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 40 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },

  vignetteBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: -40 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },

  textArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },

  narrativeText: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  buttonWrapper: {
    position: 'absolute',
    bottom: spacing.huge,
    alignSelf: 'center',
  },

  respondButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },

  respondText: {
    ...typography.button,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default WorldNarration;
