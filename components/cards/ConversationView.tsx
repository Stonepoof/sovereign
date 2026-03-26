// ─── ConversationView ────────────────────────────────────────────────────────
// 3-beat visual novel style conversation.
// Portrait, dialogue, tap to see responses, rapport bar.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize, fontWeight } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import type { ConvoBeat, ConvoResponse } from '../../types';

interface ConversationViewProps {
  npcName: string;
  beats: ConvoBeat[];
  responses: ConvoResponse[];
  rapport: number;
  onResponse: (response: ConvoResponse) => void;
}

export function ConversationView({
  npcName,
  beats,
  responses,
  rapport,
  onResponse,
}: ConversationViewProps) {
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showResponses, setShowResponses] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentBeat, fadeAnim]);

  const handleTap = () => {
    if (currentBeat < beats.length - 1) {
      setCurrentBeat((prev) => prev + 1);
    } else {
      setShowResponses(true);
    }
  };

  const beat = beats[currentBeat];
  if (!beat) return null;

  const isNPC = beat.speaker === 'npc';

  return (
    <View style={styles.container}>
      {/* Rapport bar */}
      <View style={styles.rapportContainer}>
        <Text style={styles.rapportLabel}>Rapport</Text>
        <View style={styles.rapportTrack}>
          <View
            style={[
              styles.rapportFill,
              {
                width: `${rapport}%`,
                backgroundColor:
                  rapport >= 60 ? colors.success : rapport >= 30 ? colors.warning : colors.danger,
              },
            ]}
          />
        </View>
        <Text style={styles.rapportValue}>{rapport}</Text>
      </View>

      {/* Conversation area */}
      <TouchableOpacity
        onPress={showResponses ? undefined : handleTap}
        activeOpacity={0.9}
        style={styles.dialogueArea}
      >
        <Animated.View style={[styles.beatContainer, { opacity: fadeAnim }]}>
          {/* Speaker portrait */}
          <View style={[styles.portrait, isNPC ? styles.npcPortrait : styles.playerPortrait]}>
            <Text style={styles.portraitEmoji}>{isNPC ? '👑' : '🗣'}</Text>
          </View>

          {/* Speaker name */}
          <Text style={styles.speakerName}>
            {isNPC ? npcName : 'You'}
          </Text>

          {/* Dialogue */}
          <View style={[styles.dialogueBubble, isNPC ? styles.npcBubble : styles.playerBubble]}>
            <Text style={styles.dialogueText}>{beat.text}</Text>
          </View>
        </Animated.View>

        {!showResponses && (
          <Text style={styles.tapHint}>
            {currentBeat < beats.length - 1 ? 'Tap to continue' : 'Tap to respond'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Response options */}
      {showResponses && (
        <ScrollView style={styles.responsesContainer}>
          {responses.map((resp, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onResponse(resp)}
              style={styles.responseButton}
              activeOpacity={0.7}
            >
              <Text style={styles.responseText}>{resp.label}</Text>
              <Text
                style={[
                  styles.responseDelta,
                  {
                    color: resp.rapportDelta >= 0 ? colors.success : colors.danger,
                  },
                ]}
              >
                {resp.rapportDelta > 0 ? '+' : ''}
                {resp.rapportDelta} rapport
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card.conversation,
    borderRadius: borderRadius.xl,
    margin: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  rapportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  rapportLabel: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rapportTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  rapportFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  rapportValue: {
    fontSize: fontSize.xxs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    width: 24,
    textAlign: 'right',
  },
  dialogueArea: {
    flex: 1,
    justifyContent: 'center',
  },
  beatContainer: {
    alignItems: 'center',
  },
  portrait: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
  },
  npcPortrait: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.gold,
  },
  playerPortrait: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.info,
  },
  portraitEmoji: {
    fontSize: 28,
  },
  speakerName: {
    fontSize: fontSize.sm,
    color: colors.gold,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  dialogueBubble: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    maxWidth: '90%',
  },
  npcBubble: {
    backgroundColor: colors.surfaceLight,
  },
  playerBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dialogueText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: fontSize.md * 1.6,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: fontSize.xxs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  responsesContainer: {
    maxHeight: 200,
    marginTop: spacing.md,
  },
  responseButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  responseText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  responseDelta: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.medium,
  },
});
