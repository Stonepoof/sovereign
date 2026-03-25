/**
 * Sovereign -- DistrictMap
 *
 * Radial 5-node district visualization in a 390x200 container.
 * Nodes positioned at fixed percentages with connecting lines.
 * Each node shows unrest-colored border with pulse on high unrest.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { DistrictId } from '../../types';
import { DISTRICTS, ADJACENCY } from '../../data';
import { useDistrictStore } from '../../stores';
import { colors } from '../../theme/colors';
import { DistrictNode } from './DistrictNode';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DistrictMapProps {
  onSelectDistrict?: (id: DistrictId) => void;
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const MAP_WIDTH = 390;
const MAP_HEIGHT = 200;

/**
 * Fixed positions for each district (percentage of container).
 * Matches the spec positions adjusted to data:
 *   Capital: center, Market: left, Temple: right, Docks: bottom-left, Slums: bottom-right
 */
const NODE_POSITIONS: Record<DistrictId, { x: number; y: number }> = {
  capital: { x: 50, y: 30 },
  market: { x: 20, y: 25 },
  temple: { x: 80, y: 25 },
  docks: { x: 20, y: 75 },
  slums: { x: 80, y: 75 },
};

// ---------------------------------------------------------------------------
// Line drawing
// ---------------------------------------------------------------------------

/** Render a thin gray line between two node centers using a rotated View. */
function ConnectionLine({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <View
      style={[
        lineStyles.line,
        {
          width: length,
          left: x1,
          top: y1,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

const lineStyles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.border,
    transformOrigin: '0 0',
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DistrictMap({ onSelectDistrict }: DistrictMapProps) {
  const districts = useDistrictStore((s) => s.districts);
  const [selectedId, setSelectedId] = useState<DistrictId | null>(null);

  const handlePress = (id: DistrictId) => {
    setSelectedId(id);
    onSelectDistrict?.(id);
  };

  // Build unique adjacency edges (avoid duplicates)
  const edges: { from: DistrictId; to: DistrictId }[] = [];
  const seen = new Set<string>();
  for (const [from, neighbors] of Object.entries(ADJACENCY)) {
    for (const to of neighbors) {
      const key = [from, to].sort().join('-');
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ from: from as DistrictId, to: to as DistrictId });
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Connection lines */}
      {edges.map((edge) => {
        const p1 = NODE_POSITIONS[edge.from];
        const p2 = NODE_POSITIONS[edge.to];
        // Node center offset (~20px for half of 40px node)
        const x1 = (p1.x / 100) * MAP_WIDTH;
        const y1 = (p1.y / 100) * MAP_HEIGHT;
        const x2 = (p2.x / 100) * MAP_WIDTH;
        const y2 = (p2.y / 100) * MAP_HEIGHT;
        return (
          <ConnectionLine
            key={`${edge.from}-${edge.to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        );
      })}

      {/* District nodes */}
      {DISTRICTS.map((def) => {
        const pos = NODE_POSITIONS[def.id];
        const state = districts[def.id];
        // Position: center the node (offset by half size ~20px)
        const left = (pos.x / 100) * MAP_WIDTH - 20;
        const top = (pos.y / 100) * MAP_HEIGHT - 20;

        return (
          <View
            key={def.id}
            style={{ position: 'absolute', left, top }}
          >
            <DistrictNode
              district={state}
              selected={selectedId === def.id}
              onPress={() => handlePress(def.id)}
            />
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    alignSelf: 'center',
    position: 'relative',
  },
});
