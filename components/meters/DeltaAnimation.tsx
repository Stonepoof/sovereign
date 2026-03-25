/**
 * Sovereign -- DeltaAnimation
 *
 * Floating +N/-N animations that appear after meter changes.
 * Each delta text floats upward and fades out with staggered timing.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import type { MeterDelta, MeterName } from '../../types';
import { METERS } from '../../data/meters';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DeltaAnimationProps {
  deltas: MeterDelta[];
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Single Delta Item
// ---------------------------------------------------------------------------

interface DeltaItemProps {
  delta: MeterDelta;
  index: number;
  onFinish?: () => void;
}

/** Map meter names to horizontal offsets for positioning near their bar. */
const METER_INDEX: Record<MeterName, number> = {
  authority: 0,
  populace: 1,
  treasury: 2,
  military: 3,
  stability: 4,
};

function DeltaItem({ delta, index, onFinish }: DeltaItemProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const staggerDelay = index * 100;
  const isPositive = delta.amount > 0;
  const displayText = isPositive ? `+${delta.amount}` : `${delta.amount}`;
  const textColor = isPositive ? '#28a745' : '#dc3545';

  useEffect(() => {
    // Float up 30px over 700ms (after stagger delay)
    Animated.sequence([
      Animated.delay(staggerDelay),
      Animated.timing(translateY, {
        toValue: -30,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // Visible for 700ms, then fade out over 300ms (after stagger delay)
    Animated.sequence([
      Animated.delay(staggerDelay),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Fire completion callback after total duration
    if (onFinish) {
      const timeout = setTimeout(onFinish, staggerDelay + 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <Animated.Text
      style={[
        styles.deltaText,
        { color: textColor },
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {displayText}
    </Animated.Text>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeltaAnimation({ deltas, onComplete }: DeltaAnimationProps) {
  const completedCount = React.useRef(0);

  if (deltas.length === 0) return null;

  const handleItemFinish = () => {
    completedCount.current += 1;
    if (completedCount.current >= deltas.length && onComplete) {
      onComplete();
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {deltas.map((delta, i) => (
        <DeltaItem
          key={`${delta.meter}-${delta.amount}-${i}`}
          delta={delta}
          index={i}
          onFinish={handleItemFinish}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  deltaText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default DeltaAnimation;
