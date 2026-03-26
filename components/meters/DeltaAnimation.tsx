// ─── DeltaAnimation ──────────────────────────────────────────────────────────
// Floating +N / -N delta indicators.
// Green for positive, red for negative.

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';

interface DeltaAnimationProps {
  delta: number;
  meter: string;
  index?: number;
}

export function DeltaAnimation({ delta, meter, index = 0 }: DeltaAnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 100;

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 850,
            useNativeDriver: false,
          }),
        ]),
        Animated.timing(translateY, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delta, index, opacity, translateY]);

  const isPositive = delta > 0;
  const displayText = isPositive ? `+${delta}` : `${delta}`;
  const textColor = isPositive ? colors.success : colors.danger;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{displayText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -10,
    right: -5,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
