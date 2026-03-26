// ─── WorldNarration ──────────────────────────────────────────────────────────
// 2-phase narration card: text phase, then "Respond" button.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface WorldNarrationProps {
  narrative: string;
  onRespond: () => void;
}

export function WorldNarration({ narrative, onRespond }: WorldNarrationProps) {
  const [showButton, setShowButton] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: false,
    }).start();

    // Show button after reading time
    const words = narrative.split(/\s+/).length;
    const readTime = Math.max(2000, words * 180);

    const timer = setTimeout(() => {
      setShowButton(true);
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }, readTime);

    return () => clearTimeout(timer);
  }, [narrative, fadeAnim, buttonFade]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.label}>NARRATION</Text>
      <Text style={styles.narrative}>{narrative}</Text>

      {showButton && (
        <Animated.View style={{ opacity: buttonFade }}>
          <TouchableOpacity onPress={onRespond} style={styles.respondButton}>
            <Text style={styles.respondText}>Respond</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    margin: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  label: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  narrative: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.7,
    marginBottom: spacing.xl,
  },
  respondButton: {
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    alignSelf: 'center',
  },
  respondText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#000000',
  },
});
