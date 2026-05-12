/**
 * RestTimer Component
 *
 * Floating countdown timer that appears after logging a set.
 * Shows seconds remaining + circular progress.
 * Auto-dismisses when timer reaches 0.
 *
 * Positioned at the bottom of the screen as a floating bar.
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
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  };

  return (
    <View style={styles.container}>
      {/* Progress bar background */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <Text variant="bodyBold" color="textPrimary">
          Rest: {formatTime(remaining)}
        </Text>
        <Pressable onPress={clearRestTimer} style={styles.skipButton}>
          <Text variant="caption" color="primary">
            SKIP
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressBg: {
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
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
