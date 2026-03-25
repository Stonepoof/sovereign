/**
 * Sovereign -- TraitCeremony Overlay
 *
 * Dramatic reveal overlay shown after origin card 6 when the player's
 * defining trait is assigned. Full overlay with dark background, gold
 * accent glow, trait icon, and name. Auto-dismisses after 3s or on tap.
 *
 * @see SOV_PRD_08_ONBOARDING -- trait reveal at card 6
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';

import type { DefiningTrait } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TraitCeremonyProps {
  trait: DefiningTrait;
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Trait Display Data
// ---------------------------------------------------------------------------

const TRAIT_INFO: Record<
  DefiningTrait,
  { icon: string; label: string; description: string }
> = {
  vendetta: {
    icon: '\u2694\uFE0F', // swords
    label: 'Vendetta',
    description: 'You seek justice through retribution. The guilty will answer.',
  },
  reformer: {
    icon: '\uD83D\uDD4A\uFE0F', // dove
    label: 'Reformer',
    description: 'You build from ashes. Hope is harder than anger.',
  },
  ambitious: {
    icon: '\uD83D\uDC51', // crown
    label: 'Ambitious',
    description: 'You seize what others fear to claim. The old order burned.',
  },
  guardian: {
    icon: '\uD83D\uDEE1\uFE0F', // shield
    label: 'Guardian',
    description: 'You protect those who cannot protect themselves.',
  },
};

/** Auto-dismiss after this many milliseconds. */
const AUTO_DISMISS_MS = 3000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TraitCeremony({ trait, onDismiss }: TraitCeremonyProps) {
  const info = TRAIT_INFO[trait];

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Scale up icon with spring
    Animated.spring(iconScale, {
      toValue: 1,
      damping: 12,
      stiffness: 100,
      useNativeDriver: false,
    }).start();

    // Fade in text after icon settles
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();

    // Gold glow pulse
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();

    // Auto-dismiss timer
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        {/* Gold glow background */}
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

        <View style={styles.content}>
          {/* Icon */}
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: iconScale }] }]}>
            <Text style={styles.icon}>{info.icon}</Text>
          </Animated.View>

          {/* Label */}
          <Animated.View style={{ opacity: textOpacity }}>
            <Text style={styles.label}>DEFINING TRAIT</Text>
            <Text style={styles.traitName}>{info.label}</Text>
            <Text style={styles.description}>{info.description}</Text>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },

  pressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.gold,
    opacity: 0,
    // Soft glow effect
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 60,
  },

  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold + '60',
  },

  icon: {
    fontSize: 48,
  },

  label: {
    ...typography.label,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 3,
    fontSize: 11,
    marginBottom: spacing.sm,
  },

  traitName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});

export default TraitCeremony;
