// ─── Bridge ──────────────────────────────────────────────────────────────────
// Full-screen fade in / hold / fade out transition overlay.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';

interface BridgeProps {
  text?: string;
  holdMs?: number;
  onComplete: () => void;
}

export function Bridge({ text, holdMs = 1500, onComplete }: BridgeProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      // Hold
      Animated.delay(holdMs),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start(onComplete);
  }, [fadeAnim, holdMs, onComplete]);

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {text && <Text style={styles.text}>{text}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 250,
  },
  text: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.gold,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
