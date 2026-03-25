/**
 * Sovereign -- MeterHeader
 *
 * Sticky header showing all 5 governance meters + week indicator.
 * Supports compact (horizontal row) and expanded (vertical stack) modes
 * with an animated height transition.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useMeterStore } from '../../stores';
import { useGameStore } from '../../stores';
import { METERS } from '../../data/meters';
import { colors } from '../../theme/colors';
import { MeterBar } from './MeterBar';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MeterHeaderProps {
  expanded?: boolean;
  onToggle?: () => void;
  week?: number;
  act?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MeterHeader({
  expanded: controlledExpanded,
  onToggle,
  week: weekProp,
  act: actProp,
}: MeterHeaderProps) {
  const meters = useMeterStore((s) => s.meters);
  const week = weekProp ?? useGameStore((s) => s.week);
  const act = actProp ?? useGameStore((s) => s.act);
  const trait = useGameStore((s) => s.trait);
  const corruption = useGameStore((s) => s.corruption);

  // Internal expanded state if uncontrolled
  const [internalExpanded, setInternalExpanded] = React.useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  return (
    <Pressable onPress={handleToggle} style={styles.wrapper}>
      <View style={[styles.container, isExpanded ? styles.containerExpanded : styles.containerCompact]}>
        {isExpanded ? (
          // Expanded: vertical stack with labels and extra info
          <View style={styles.expandedContent}>
            <View style={styles.expandedHeader}>
              <Text style={styles.weekTextExpanded}>
                Act {act} — Week {week}
              </Text>
              {trait && (
                <Text style={styles.traitText}>
                  {trait.charAt(0).toUpperCase() + trait.slice(1)}
                </Text>
              )}
            </View>

            {METERS.map((def) => (
              <MeterBar
                key={def.name}
                name={def.name}
                value={meters[def.name]}
                icon={def.icon}
                label={def.label}
                color={def.color}
                compact={false}
              />
            ))}

            {corruption > 0 && (
              <View style={styles.corruptionRow}>
                <Text style={styles.corruptionIcon}>{'💀'}</Text>
                <Text style={styles.corruptionLabel}>Corruption</Text>
                <View style={styles.corruptionBarTrack}>
                  <View
                    style={[
                      styles.corruptionBarFill,
                      { width: `${corruption}%` },
                    ]}
                  />
                </View>
                <Text style={styles.corruptionValue}>{corruption}</Text>
              </View>
            )}
          </View>
        ) : (
          // Compact: horizontal row of meters + week
          <View style={styles.compactContent}>
            <View style={styles.metersRow}>
              {METERS.map((def) => (
                <MeterBar
                  key={def.name}
                  name={def.name}
                  value={meters[def.name]}
                  icon={def.icon}
                  color={def.color}
                  compact
                />
              ))}
            </View>

            <Text style={styles.weekTextCompact}>Week {week}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  container: {
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containerCompact: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  containerExpanded: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  weekTextCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
  },
  expandedContent: {
    gap: 10,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekTextExpanded: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  corruptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  corruptionIcon: {
    fontSize: 16,
    width: 28,
    textAlign: 'center',
  },
  corruptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    width: 70,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  corruptionBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  corruptionBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8b0000',
  },
  corruptionValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8b0000',
    width: 30,
    textAlign: 'right',
  },
});

export default MeterHeader;
