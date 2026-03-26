// ─── Map Tab ─────────────────────────────────────────────────────────────────
// DistrictMap + DistrictDetail panel.

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { DistrictMap } from '../../components/map/DistrictMap';
import { DistrictDetail } from '../../components/map/DistrictDetail';
import { useGameStore } from '../../stores/gameStore';

export default function MapScreen() {
  const districts = useGameStore((s) => s.districts);
  const selectedDistrict = useGameStore((s) => s.selectedDistrict);
  const selectDistrict = useGameStore((s) => s.selectDistrict);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Kingdom Map</Text>
      <Text style={styles.subtitle}>Tap a district to view details</Text>

      <DistrictMap
        districts={districts}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={selectDistrict}
      />

      {selectedDistrict && (
        <DistrictDetail district={selectedDistrict} />
      )}

      {!selectedDistrict && (
        <View style={styles.emptyDetail}>
          <Text style={styles.emptyText}>
            Select a district to view its status
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
    padding: spacing.xl,
    paddingBottom: spacing.massive,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  emptyDetail: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
