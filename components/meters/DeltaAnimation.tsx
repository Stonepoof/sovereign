/**
 * Sovereign -- DeltaAnimation
 *
 * Floating +N/-N animations that appear after meter changes.
 * Each delta text floats upward and fades out with staggered timing.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
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
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const staggerDelay = index * 100;
  const isPositive = delta.amount > 0;
  const displayText = isPositive ? `+${delta.amount}` : `${delta.amount}`;
  const textColor = isPositive ? '#28a745' : '#dc3545';

  useEffect(() => {
    // Float up 30px over 700ms
    translateY.value = withDelay(
      staggerDelay,
      withTiming(-30, { duration: 700, easing: Easing.out(Easing.quad) }),
    );

    // Visible for 700ms, then fade out over 300ms
    opacity.value = withDelay(
      staggerDelay,
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        }),
      ),
    );

    // Fire completion callback after total duration
    if (onFinish) {
      const timeout = setTimeout(onFinish, staggerDelay + 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.deltaText,
        { color: textColor },
        animatedStyle,
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
