// ─── useSwipeGesture ─────────────────────────────────────────────────────────
// PanResponder-based swipe gesture hook for card interactions.
// 12px dead zone, 136px horizontal / 100px vertical commit threshold,
// 800px/s velocity override, 15-degree tilt, spring snap-back, timing exit.

import { useRef, useCallback, useState } from 'react';
import { Animated, PanResponder, Easing, Dimensions } from 'react-native';
import type { SwipeDirection } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const DEAD_ZONE = 12;
const COMMIT_X = 136;
const COMMIT_Y = 100;
const VELOCITY_OVERRIDE = 800; // px/s — if exceeded, commit regardless of distance
const MAX_TILT_DEG = 15;

interface UseSwipeGestureOptions {
  onSwipe: (direction: SwipeDirection) => void;
  enabledDirections?: SwipeDirection[];
  disabled?: boolean;
}

interface UseSwipeGestureReturn {
  pan: Animated.ValueXY;
  tilt: Animated.Value;
  scale: Animated.Value;
  panResponder: ReturnType<typeof PanResponder.create>;
  resetPosition: () => void;
  thresholdDirection: SwipeDirection | null;
}

export function useSwipeGesture({
  onSwipe,
  enabledDirections = ['left', 'right', 'up', 'down'],
  disabled = false,
}: UseSwipeGestureOptions): UseSwipeGestureReturn {
  const pan = useRef(new Animated.ValueXY()).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [thresholdDirection, setThresholdDirection] = useState<SwipeDirection | null>(null);

  const triggerPulse = useCallback(() => {
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 75,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1.0,
        duration: 75,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [scale]);

  const resetPosition = useCallback(() => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      tension: 40,
      friction: 5,
    }).start();
    Animated.spring(tilt, {
      toValue: 0,
      useNativeDriver: false,
      tension: 40,
      friction: 5,
    }).start();
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: false,
      tension: 40,
      friction: 5,
    }).start();
    setThresholdDirection(null);
  }, [pan, tilt, scale]);

  const animateExit = useCallback(
    (direction: SwipeDirection, callback: () => void) => {
      let toX = 0;
      let toY = 0;
      if (direction === 'left') toX = -SCREEN_WIDTH * 1.5;
      if (direction === 'right') toX = SCREEN_WIDTH * 1.5;
      if (direction === 'up') toY = -SCREEN_HEIGHT * 1.2;
      if (direction === 'down') toY = SCREEN_HEIGHT * 1.2;

      Animated.timing(pan, {
        toValue: { x: toX, y: toY },
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(callback);
    },
    [pan]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (disabled) return false;
        const dist = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
        return dist > DEAD_ZONE;
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        // Tilt based on horizontal movement
        const tiltDeg = (gesture.dx / COMMIT_X) * MAX_TILT_DEG;
        tilt.setValue(Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, tiltDeg)));

        // Detect threshold crossings for visual feedback
        const absX = Math.abs(gesture.dx);
        const absY = Math.abs(gesture.dy);
        let newThresholdDirection: SwipeDirection | null = null;

        if (absX > absY) {
          // Horizontal movement
          if (absX >= COMMIT_X) {
            newThresholdDirection = gesture.dx > 0 ? 'right' : 'left';
          }
        } else {
          // Vertical movement
          if (absY >= COMMIT_Y) {
            newThresholdDirection = gesture.dy > 0 ? 'down' : 'up';
          }
        }

        // Only trigger pulse and update direction if enabled and threshold just crossed
        if (newThresholdDirection && enabledDirections.includes(newThresholdDirection) && newThresholdDirection !== thresholdDirection) {
          setThresholdDirection(newThresholdDirection);
          triggerPulse();
        } else if (!newThresholdDirection && thresholdDirection) {
          setThresholdDirection(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const absX = Math.abs(gesture.dx);
        const absY = Math.abs(gesture.dy);
        const velX = Math.abs(gesture.vx * 1000);
        const velY = Math.abs(gesture.vy * 1000);

        // Determine if swipe is primarily horizontal or vertical
        let direction: SwipeDirection | null = null;

        if (absX > absY) {
          // Horizontal
          if (absX >= COMMIT_X || velX >= VELOCITY_OVERRIDE) {
            direction = gesture.dx > 0 ? 'right' : 'left';
          }
        } else {
          // Vertical
          if (absY >= COMMIT_Y || velY >= VELOCITY_OVERRIDE) {
            direction = gesture.dy > 0 ? 'down' : 'up';
          }
        }

        if (direction && enabledDirections.includes(direction)) {
          animateExit(direction, () => {
            onSwipe(direction!);
            pan.setValue({ x: 0, y: 0 });
            tilt.setValue(0);
          });
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  return { pan, tilt, scale, panResponder, resetPosition, thresholdDirection };
}
