/**
 * RestTimer Component — Floating Pill
 *
 * Floating countdown timer that auto-starts after logging a set.
 * Shows as a compact pill at the bottom with:
 * - Circular progress ring
 * - Time remaining
 * - +30s button
 * - Skip button
 * Haptic buzz when timer ends.
 */
import React, { memo, useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';
import { useWorkoutSessionStore } from '@/core/stores/workoutSessionStore';

export const RestTimer = memo(function RestTimer() {
  const restTimerEnd = useWorkoutSessionStore((s) => s.restTimerEnd);
  const restTimerDuration = useWorkoutSessionStore((s) => s.restTimerDuration);
  const clearRestTimer = useWorkoutSessionStore((s) => s.clearRestTimer);
  const startRestTimer = useWorkoutSessionStore((s) => s.startRestTimer);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!restTimerEnd) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((restTimerEnd - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        clearRestTimer();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [restTimerEnd, clearRestTimer]);

  if (!restTimerEnd || remaining <= 0) return null;

  const progress = restTimerDuration
    ? 1 - remaining / restTimerDuration
    : 0;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdd30 = () => {
    // Extend timer by 30 seconds
    startRestTimer(remaining + 30);
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Timer display */}
        <View style={styles.timerSection}>
          <View style={styles.timerDot} />
          <Text variant="h3" style={styles.timerText}>{formatTime(remaining)}</Text>
          <Text variant="caption" color="textSecondary"> rest</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={handleAdd30} style={styles.addBtn}>
            <Text variant="caption" style={styles.addBtnText}>+30s</Text>
          </Pressable>
          <Pressable onPress={clearRestTimer} style={styles.skipBtn}>
            <Text variant="bodyBold" style={styles.skipBtnText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  timerText: {
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addBtn: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
  skipBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  skipBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
