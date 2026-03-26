// ─── MeterBar ────────────────────────────────────────────────────────────────
// Compact (4px height / 60px width) + expanded (8px / full width).
// Danger pulse below 20, warning amber 20-35, RN Animated width.

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import type { MeterKey } from '../../types';

interface MeterBarProps {
  meterKey: MeterKey;
  value: number;
  compact?: boolean;
}

function getMeterFillColor(value: number, meterKey: MeterKey): string {
  if (value <= 15) return colors.danger;
  if (value <= 30) return colors.warning;
  if (value >= 85) return '#8b5cf6'; // excessive purple
  return colors.meter[meterKey];
}

export function MeterBar({ meterKey, value, compact = false }: MeterBarProps) {
  const animWidth = useRef(new Animated.Value(value)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: value,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [value, animWidth]);

  // Danger pulse
  useEffect(() => {
    if (value <= 15 || value >= 85) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [value, pulseAnim]);

  const height = compact ? 4 : 8;
  const fillColor = getMeterFillColor(value, meterKey);

  return (
    <Animated.View
      style={[
        styles.track,
        {
          height,
          width: compact ? 60 : ('100%' as const),
          opacity: pulseAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: fillColor,
            width: animWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
});
