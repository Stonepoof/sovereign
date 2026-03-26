// ─── DistrictNode ────────────────────────────────────────────────────────────
// 40px circle, unrest-colored border, pulse animation when unrest > 50.

import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import type { District } from '../../types';

interface DistrictNodeProps {
  district: District;
  isSelected: boolean;
  onPress: () => void;
}

function getUnrestColor(unrest: number): string {
  if (unrest >= 70) return colors.danger;
  if (unrest >= 50) return colors.warning;
  if (unrest >= 30) return '#f0ad4e80';
  return colors.success;
}

export function DistrictNode({ district, isSelected, onPress }: DistrictNodeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (district.unrest > 50) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [district.unrest, pulseAnim]);

  const borderColor = getUnrestColor(district.unrest);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          left: district.x - 20,
          top: district.y - 20,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.node,
          {
            borderColor,
            backgroundColor: isSelected ? colors.surfaceLight : colors.surface,
          },
        ]}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{district.name.slice(0, 3)}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
