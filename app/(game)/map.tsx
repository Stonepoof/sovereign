/**
 * Sovereign -- Map Tab
 *
 * Shows the radial DistrictMap with 5 connected nodes, plus a DistrictDetail
 * panel below for the currently selected district.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { DistrictId } from '../../types';
import { useDistrictStore } from '../../stores';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { DistrictMap } from '../../components/map/DistrictMap';
import { DistrictDetail } from '../../components/map/DistrictDetail';

export default function MapScreen() {
  const districts = useDistrictStore((s) => s.districts);
  const [selectedId, setSelectedId] = useState<DistrictId | null>(null);

  const selectedDistrict = selectedId ? districts[selectedId] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.header}>District Map</Text>
      <Text style={styles.subtitle}>
        Tap a district to view details
      </Text>

      {/* Radial Map */}
      <View style={styles.mapWrapper}>
        <DistrictMap onSelectDistrict={setSelectedId} />
      </View>

      {/* Detail Panel */}
      {selectedDistrict ? (
        <View style={styles.detailWrapper}>
          <DistrictDetail district={selectedDistrict} />
        </View>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Select a district on the map above to see its stats
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.massive,
  },
  header: {
    ...typography.h1,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  mapWrapper: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  detailWrapper: {
    marginTop: spacing.sm,
  },
  hint: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  hintText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
