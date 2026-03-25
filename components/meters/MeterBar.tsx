/**
 * Sovereign -- MeterBar
 *
 * Single governance meter bar with compact and expanded modes.
 * Supports danger/warning/safe visual states and smooth value transitions.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import type { MeterName } from '../../types';
import { colors } from '../../theme/colors';
import { getMeterZone } from '../../data/meters';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MeterBarProps {
  name: MeterName;
  value: number; // 0-100
  icon: string; // emoji
  label?: string; // shown in expanded mode
  compact?: boolean;
  delta?: number; // show floating +/-
  color?: string; // meter-specific color override
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DANGER_COLOR = '#dc3545';
const WARNING_COLOR = '#ff9800';

const COMPACT_BAR_HEIGHT = 4;
const COMPACT_BAR_WIDTH = 60;
const EXPANDED_BAR_HEIGHT = 8;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MeterBar({
  name,
  value,
  icon,
  label,
  compact = true,
  delta,
  color,
}: MeterBarProps) {
  const zone = getMeterZone(value);
  const meterColor = color ?? (colors[name] || colors.textPrimary);

  // Animated bar width (0-100 percentage)
  const barWidth = useRef(new Animated.Value(value)).current;
  // Danger pulse opacity
  const pulseOpacity = useRef(new Animated.Value(1)).current;
  // Ref to store the pulse animation so we can stop it
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.timing(barWidth, {
      toValue: value,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [value]);

  // Danger pulse animation
  useEffect(() => {
    if (zone === 'danger') {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1.0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      );
      pulseAnimRef.current = pulseAnim;
      pulseAnim.start();
    } else {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
      Animated.timing(pulseOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
        pulseAnimRef.current = null;
      }
    };
  }, [zone]);

  // Determine bar fill color based on zone
  const fillColor = zone === 'danger' ? DANGER_COLOR : zone === 'warning' ? WARNING_COLOR : meterColor;

  const barHeight = compact ? COMPACT_BAR_HEIGHT : EXPANDED_BAR_HEIGHT;

  // Interpolate barWidth (0-100) to a percentage string via width style
  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={compact ? styles.containerCompact : styles.containerExpanded}>
      {/* Icon */}
      <Text style={compact ? styles.iconCompact : styles.iconExpanded}>{icon}</Text>

      {/* Label (expanded only) */}
      {!compact && label && (
        <Text style={styles.label}>{label}</Text>
      )}

      {/* Bar container */}
      <View
        style={[
          styles.barTrack,
          {
            height: barHeight,
            borderRadius: barHeight / 2,
          },
          compact ? { width: COMPACT_BAR_WIDTH } : styles.barTrackExpanded,
          zone === 'warning' && styles.barTrackWarning,
          zone === 'danger' && styles.barTrackDanger,
        ]}
      >
        <Animated.View
          style={[
            styles.barFill,
            {
              height: barHeight,
              borderRadius: barHeight / 2,
              backgroundColor: fillColor,
              width: animatedWidth,
              opacity: pulseOpacity,
            },
          ]}
        />
      </View>

      {/* Value text */}
      <Text style={[
        compact ? styles.valueCompact : styles.valueExpanded,
        zone === 'danger' && { color: DANGER_COLOR },
        zone === 'warning' && { color: WARNING_COLOR },
      ]}>
        {Math.round(value)}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  containerCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  containerExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  iconCompact: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  iconExpanded: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 70,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  barTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  barTrackExpanded: {
    flex: 1,
  },
  barTrackWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
  },
  barTrackDanger: {
    backgroundColor: 'rgba(220, 53, 69, 0.15)',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  valueCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 24,
    textAlign: 'right',
  },
  valueExpanded: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    width: 30,
    textAlign: 'right',
  },
});

export default MeterBar;
