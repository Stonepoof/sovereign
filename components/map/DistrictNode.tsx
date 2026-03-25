/**
 * Sovereign -- DistrictNode
 *
 * Single district node on the radial map. 40px circle with icon emoji,
 * border color by unrest level, pulse animation when unrest > 50.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import type { DistrictState } from '../../types';
import { DISTRICTS } from '../../data';
import { colors } from '../../theme/colors';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DistrictNodeProps {
  district: DistrictState;
  selected: boolean;
  onPress: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUnrestColor(unrest: number): string {
  if (unrest > 50) return colors.error;
  if (unrest >= 25) return colors.warning;
  return colors.success;
}

function getDistrictIcon(id: string): string {
  const def = DISTRICTS.find((d) => d.id === id);
  return def?.icon ?? '?';
}

function getDistrictName(id: string): string {
  const def = DISTRICTS.find((d) => d.id === id);
  return def?.name ?? id;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DistrictNode({ district, selected, onPress }: DistrictNodeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shouldPulse = district.unrest > 50;

  useEffect(() => {
    if (shouldPulse) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [shouldPulse]);

  const borderColor = getUnrestColor(district.unrest);
  const size = selected ? 44 : 40;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.touchArea}
    >
      <Animated.View
        style={[
          styles.node,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor,
            borderWidth: selected ? 3 : 2,
            opacity: shouldPulse ? pulseAnim : 1,
          },
          selected && styles.selectedNode,
        ]}
      >
        <Text style={styles.icon}>{getDistrictIcon(district.id)}</Text>
      </Animated.View>
      <Text style={styles.nameLabel} numberOfLines={1}>
        {getDistrictName(district.id)}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  touchArea: {
    alignItems: 'center',
    position: 'absolute',
  },
  node: {
    backgroundColor: colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedNode: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    fontSize: 20,
  },
  nameLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: 60,
  },
});
