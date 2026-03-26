// ─── DistrictMap ─────────────────────────────────────────────────────────────
// 390x200 map view with 5 nodes and connection lines.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';
import { DistrictNode } from './DistrictNode';
import type { District } from '../../types';

interface DistrictMapProps {
  districts: District[];
  selectedDistrict: District | null;
  onSelectDistrict: (district: District) => void;
}

export function DistrictMap({
  districts,
  selectedDistrict,
  onSelectDistrict,
}: DistrictMapProps) {
  // Render connection lines as simple View elements
  const connections: { from: District; to: District }[] = [];
  const seen = new Set<string>();

  for (const district of districts) {
    for (const targetId of district.connectedTo) {
      const key = [district.id, targetId].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        const target = districts.find((d) => d.id === targetId);
        if (target) {
          connections.push({ from: district, to: target });
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Connection lines (rendered as thin positioned views) */}
      {connections.map((conn, i) => {
        const dx = conn.to.x - conn.from.x;
        const dy = conn.to.y - conn.from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={i}
            style={[
              styles.connectionLine,
              {
                left: conn.from.x,
                top: conn.from.y,
                width: length,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: '0 0',
              },
            ]}
          />
        );
      })}

      {/* District nodes */}
      {districts.map((district) => (
        <DistrictNode
          key={district.id}
          district={district}
          isSelected={selectedDistrict?.id === district.id}
          onPress={() => onSelectDistrict(district)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 390,
    height: 200,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.surfaceBorder,
  },
});
