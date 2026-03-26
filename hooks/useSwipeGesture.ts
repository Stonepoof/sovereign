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
  commitScale: Animated.Value;
  isCommitted: boolean;
  committedDirection: SwipeDirection | null;
  panResponder: ReturnType<typeof PanResponder.create>;
  resetPosition: () => void;
}

export function useSwipeGesture({
  onSwipe,
  enabledDirections = ['left', 'right', 'up', 'down'],
  disabled = false,
}: UseSwipeGestureOptions): UseSwipeGestureReturn {
  const pan = useRef(new Animated.ValueXY()).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const commitScale = useRef(new Animated.Value(1)).current;
  const [isCommitted, setIsCommitted] = useState(false);
  const [committedDirection, setCommittedDirection] = useState<SwipeDirection | null>(null);
  const wasCommitted = useRef(false);

  const triggerCommitPulse = useCallback(() => {
    Animated.sequence([
      Animated.timing(commitScale, {
        toValue: 1.05,
        duration: 75,
        useNativeDriver: false,
      }),
      Animated.timing(commitScale, {
        toValue: 1.0,
        duration: 75,
        useNativeDriver: false,
      }),
    ]).start();
  }, [commitScale]);

  const resetPosition = useCallback(() => {
    setIsCommitted(false);
    setCommittedDirection(null);
    wasCommitted.current = false;
    commitScale.setValue(1);
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
  }, [pan, tilt, commitScale]);

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

        // Check commit threshold
        const absX = Math.abs(gesture.dx);
        const absY = Math.abs(gesture.dy);
        let crossedThreshold = false;
        let dir: SwipeDirection | null = null;

        if (absX > absY) {
          if (absX >= COMMIT_X) {
            crossedThreshold = true;
            dir = gesture.dx > 0 ? 'right' : 'left';
          }
        } else {
          if (absY >= COMMIT_Y) {
            crossedThreshold = true;
            dir = gesture.dy > 0 ? 'down' : 'up';
          }
        }

        if (crossedThreshold && dir && enabledDirections.includes(dir)) {
          if (!wasCommitted.current) {
            wasCommitted.current = true;
            setIsCommitted(true);
            setCommittedDirection(dir);
            triggerCommitPulse();
          } else {
            // Direction may change while still committed
            setCommittedDirection(dir);
          }
        } else {
          if (wasCommitted.current) {
            wasCommitted.current = false;
            setIsCommitted(false);
            setCommittedDirection(null);
            commitScale.setValue(1);
          }
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
            commitScale.setValue(1);
            wasCommitted.current = false;
            setIsCommitted(false);
            setCommittedDirection(null);
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

  return { pan, tilt, commitScale, isCommitted, committedDirection, panResponder, resetPosition };
}
