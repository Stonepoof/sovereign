// ─── useMeterAnimation ───────────────────────────────────────────────────────
// Floating delta animation: +N / -N floats up 30px, 1s duration,
// staggered by 100ms per meter, green for positive, red for negative.

import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import type { MeterDelta } from '../types';

interface DeltaAnimState {
  opacity: Animated.Value;
  translateY: Animated.Value;
  delta: number;
  meter: string;
  key: number;
}

interface UseMeterAnimationReturn {
  deltas: DeltaAnimState[];
  triggerDeltas: (meterDeltas: MeterDelta[]) => void;
}

let _animKey = 0;

export function useMeterAnimation(): UseMeterAnimationReturn {
  const deltasRef = useRef<DeltaAnimState[]>([]);
  // Force re-render by tracking a version
  const versionRef = useRef(new Animated.Value(0)).current;

  const triggerDeltas = useCallback(
    (meterDeltas: MeterDelta[]) => {
      const newAnims: DeltaAnimState[] = meterDeltas.map((md, index) => {
        const opacity = new Animated.Value(0);
        const translateY = new Animated.Value(0);
        const key = ++_animKey;

        // Stagger start
        setTimeout(() => {
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
          ]).start(() => {
            // Remove from array after animation
            deltasRef.current = deltasRef.current.filter((d) => d.key !== key);
          });
        }, index * 100);

        return {
          opacity,
          translateY,
          delta: md.delta,
          meter: md.meter,
          key,
        };
      });

      deltasRef.current = [...deltasRef.current, ...newAnims];
      // Trigger re-render
      versionRef.setValue(Date.now());
    },
    [versionRef]
  );

  return { deltas: deltasRef.current, triggerDeltas };
}
