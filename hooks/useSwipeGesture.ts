/**
 * Sovereign -- Swipe Gesture Hook
 *
 * 4-direction release-based swipe gesture using React Native's built-in
 * PanResponder and Animated APIs. Powers the core card interaction.
 *
 * State machine: IDLE -> DRAGGING -> COMMITTED/SNAPPING_BACK -> EXITING
 *
 * @see SOV_PRD_03_CORE_GAMEPLAY section 3 -- swipe thresholds, velocity override
 */

import { useCallback, useRef, useMemo } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';
import type { Direction } from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum displacement before direction detection activates. */
const DEAD_ZONE = 12;

/** Horizontal displacement required to commit a swipe. */
const COMMIT_THRESHOLD_X = 136;

/** Vertical displacement required to commit a swipe. */
const COMMIT_THRESHOLD_Y = 100;

/** Velocity (px/s) that overrides position threshold. */
const VELOCITY_OVERRIDE = 800;

/** Minimum displacement required for velocity override to apply. */
const VELOCITY_MIN_DISPLACEMENT = 40;

/** Distance card flies off-screen during exit animation. */
const EXIT_DISTANCE = 500;

/** Duration of the exit fly-off animation in ms. */
const EXIT_DURATION = 250;

/** Maximum card rotation in degrees during horizontal drag. */
const MAX_TILT_DEG = 15;

/** Scale applied while the card is being dragged. */
const DRAG_SCALE = 1.01;

/** Spring config for snap-back. */
const SNAP_SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
  overshootClamping: false,
  restDisplacementThreshold: 0.5,
  restSpeedThreshold: 0.5,
  useNativeDriver: false,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SwipeGestureConfig {
  /** Called when the player commits to a direction (after exit animation). */
  onCommit: (direction: Direction) => void;
  /** Returns whether a given direction has an option available. */
  isOptionAvailable: (direction: Direction) => boolean;
  /** Whether the gesture is active. Defaults to true. */
  enabled?: boolean;
}

export interface SwipeGestureReturn {
  /** The PanResponder instance to spread onto a View. */
  panResponder: ReturnType<typeof PanResponder.create>;
  /** Animated style to apply to the card's Animated.View. */
  animatedStyle: {
    transform: Array<
      | { translateX: Animated.Value }
      | { translateY: Animated.Value }
      | { rotate: Animated.AnimatedInterpolation<string> }
      | { scale: Animated.Value }
    >;
  };
  /** Currently active swipe direction (read via .current). */
  activeDirection: React.MutableRefObject<Direction | null>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determine the dominant swipe direction from displacement.
 * Returns null if displacement is within the dead zone.
 */
function detectDirection(dx: number, dy: number): Direction | null {
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx < DEAD_ZONE && absDy < DEAD_ZONE) {
    return null;
  }

  if (absDx >= absDy) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

/**
 * Check if position exceeds the commit threshold for the given direction.
 */
function isPastThreshold(dx: number, dy: number, direction: Direction | null): boolean {
  if (!direction) return false;

  switch (direction) {
    case 'left':
    case 'right':
      return Math.abs(dx) >= COMMIT_THRESHOLD_X;
    case 'up':
    case 'down':
      return Math.abs(dy) >= COMMIT_THRESHOLD_Y;
  }
}

/**
 * Check if velocity overrides the position threshold.
 */
function isVelocityOverride(
  dx: number,
  dy: number,
  vx: number,
  vy: number,
  direction: Direction | null,
): boolean {
  if (!direction) return false;

  const isHorizontal = direction === 'left' || direction === 'right';
  const displacement = isHorizontal ? Math.abs(dx) : Math.abs(dy);
  const velocity = isHorizontal ? Math.abs(vx) : Math.abs(vy);

  return displacement >= VELOCITY_MIN_DISPLACEMENT && velocity >= VELOCITY_OVERRIDE;
}

/**
 * Get the exit translation target for a committed direction.
 */
function getExitTarget(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case 'left':
      return { x: -EXIT_DISTANCE, y: 0 };
    case 'right':
      return { x: EXIT_DISTANCE, y: 0 };
    case 'up':
      return { x: 0, y: -EXIT_DISTANCE };
    case 'down':
      return { x: 0, y: EXIT_DISTANCE };
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSwipeGesture(config: SwipeGestureConfig): SwipeGestureReturn {
  const { onCommit, isOptionAvailable, enabled = true } = config;

  // Animated values for card position
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Track state
  const isExitingRef = useRef(false);
  const activeDirection = useRef<Direction | null>(null);

  // Rotation interpolation based on translateX
  const rotation = translateX.interpolate({
    inputRange: [-COMMIT_THRESHOLD_X * 2, 0, COMMIT_THRESHOLD_X * 2],
    outputRange: [`-${MAX_TILT_DEG}deg`, '0deg', `${MAX_TILT_DEG}deg`],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled && !isExitingRef.current,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!enabled || isExitingRef.current) return false;
          const { dx, dy } = gestureState;
          return Math.abs(dx) > DEAD_ZONE || Math.abs(dy) > DEAD_ZONE;
        },
        onPanResponderGrant: () => {
          scale.setValue(DRAG_SCALE);
        },
        onPanResponderMove: (_, gestureState) => {
          if (isExitingRef.current) return;
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
          activeDirection.current = detectDirection(gestureState.dx, gestureState.dy);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isExitingRef.current) return;

          const { dx, dy, vx, vy } = gestureState;
          const direction = detectDirection(dx, dy);

          // No direction detected -- snap back
          if (!direction) {
            activeDirection.current = null;
            Animated.spring(translateX, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(translateY, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(scale, { toValue: 1, ...SNAP_SPRING_CONFIG }).start();
            return;
          }

          const shouldCommit =
            isPastThreshold(dx, dy, direction) ||
            isVelocityOverride(dx, dy, vx, vy, direction);

          if (shouldCommit && isOptionAvailable(direction)) {
            // Exit animation
            isExitingRef.current = true;
            const target = getExitTarget(direction);

            Animated.parallel([
              Animated.timing(translateX, {
                toValue: target.x,
                duration: EXIT_DURATION,
                easing: Easing.linear,
                useNativeDriver: false,
              }),
              Animated.timing(translateY, {
                toValue: target.y,
                duration: EXIT_DURATION,
                easing: Easing.linear,
                useNativeDriver: false,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: EXIT_DURATION,
                useNativeDriver: false,
              }),
            ]).start(() => {
              onCommit(direction);
              // Reset values for next card
              isExitingRef.current = false;
              activeDirection.current = null;
              translateX.setValue(0);
              translateY.setValue(0);
              scale.setValue(1);
            });
          } else {
            // Snap back to center
            activeDirection.current = null;
            Animated.spring(translateX, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(translateY, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(scale, { toValue: 1, ...SNAP_SPRING_CONFIG }).start();
          }
        },
        onPanResponderTerminate: () => {
          if (!isExitingRef.current) {
            activeDirection.current = null;
            Animated.spring(translateX, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(translateY, { toValue: 0, ...SNAP_SPRING_CONFIG }).start();
            Animated.spring(scale, { toValue: 1, ...SNAP_SPRING_CONFIG }).start();
          }
        },
      }),
    [enabled, onCommit, isOptionAvailable],
  );

  const animatedStyle = {
    transform: [
      { translateX },
      { translateY },
      { rotate: rotation },
      { scale },
    ] as any,
  };

  return {
    panResponder,
    animatedStyle,
    activeDirection,
  };
}

// ---------------------------------------------------------------------------
// Utility: Direction arrow symbols for display.
// ---------------------------------------------------------------------------

export const DIRECTION_ARROWS: Record<Direction, string> = {
  left: '\u2190',
  right: '\u2192',
  up: '\u2191',
  down: '\u2193',
};
