/**
 * ExerciseCard Component
 *
 * THE core UI unit of the app. Each exercise in the workout gets one card.
 * Shows:
 * - Exercise name + muscle group
 * - Previous performance
 * - Progression suggestion (with reasoning badge)
 * - Set rows (completed + active)
 *
 * Design: Large tap targets, pre-filled weights, minimal taps to log.
 */
import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text, Card, Badge } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';
import { SetRow } from './SetRow';
import { TemplateExerciseWithDetails, SetLog, ProgressionSuggestion } from '@/types/global';
import { useWorkoutSessionStore } from '@/core/stores/workoutSessionStore';

interface ExerciseCardProps {
  templateExercise: TemplateExerciseWithDetails;
  suggestion: ProgressionSuggestion;
  onRestTimer: (seconds: number) => void;
}

export const ExerciseCard = memo(function ExerciseCard({
  templateExercise,
  suggestion,
  onRestTimer,
}: ExerciseCardProps) {
  const { exercise } = templateExercise;
  const logSet = useWorkoutSessionStore((s) => s.logSet);
  const completedSets = useWorkoutSessionStore((s) =>
    s.completedSets.filter((set) => set.exerciseId === exercise.id)
  );

  const totalSetsTarget = templateExercise.targetSets;
  const allSetsComplete = completedSets.length >= totalSetsTarget;

  // Build set rows: completed ones + one active row (if not done)
  const setRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < Math.max(totalSetsTarget, completedSets.length + 1); i++) {
      const completed = completedSets[i];
      rows.push({
        setNumber: i + 1,
        isCompleted: !!completed,
        completedWeight: completed?.weight,
        completedReps: completed?.reps,
      });
      // Only show one active row at a time
      if (!completed && !allSetsComplete) break;
    }
    return rows;
  }, [completedSets, totalSetsTarget, allSetsComplete]);

  const handleLogSet = (weight: number, reps: number) => {
    logSet({
      exerciseId: exercise.id,
      weight,
      reps,
      isWarmup: false,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRestTimer(templateExercise.restSeconds);
  };

  const badgeType = suggestion.reasoning === 'reps_exceeded_target'
    ? 'improvement'
    : suggestion.reasoning === 'consistent_performance'
    ? 'improvement'
    : suggestion.reasoning === 'deload_suggested'
    ? 'deload'
    : undefined;

  return (
    <Card padding="lg" style={[styles.card, allSetsComplete && styles.completedCard]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="h3">{exercise.name}</Text>
          {badgeType && <Badge type={badgeType} />}
        </View>
        <Text variant="caption" color="textSecondary">
          {exercise.muscleGroup} · {exercise.equipment}
        </Text>
      </View>

      {/* Previous performance + suggestion */}
      <View style={styles.infoSection}>
        {suggestion.previousWeight > 0 ? (
          <Text variant="caption" color="textSecondary">
            Last: {suggestion.previousWeight}kg × {suggestion.previousReps}
          </Text>
        ) : (
          <Text variant="caption" color="textTertiary">
            No previous data
          </Text>
        )}
        {suggestion.suggestedWeight > 0 && (
          <Text variant="caption" color="primary">
            Suggested: {suggestion.suggestedWeight}kg × {suggestion.suggestedRepsMin}-{suggestion.suggestedRepsMax}
          </Text>
        )}
      </View>

      {/* Set rows */}
      <View style={styles.setsContainer}>
        {setRows.map((row) => (
          <SetRow
            key={row.setNumber}
            setNumber={row.setNumber}
            suggestedWeight={suggestion.suggestedWeight}
            suggestedReps={`${suggestion.suggestedRepsMin}-${suggestion.suggestedRepsMax}`}
            isCompleted={row.isCompleted}
            completedWeight={row.completedWeight}
            completedReps={row.completedReps}
            onLogSet={handleLogSet}
          />
        ))}
      </View>

      {/* Progress indicator */}
      <Text variant="caption" color="textTertiary" style={styles.progress}>
        {completedSets.length}/{totalSetsTarget} sets
      </Text>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  completedCard: {
    borderColor: 'rgba(48, 209, 88, 0.3)',
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoSection: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  setsContainer: {
    marginBottom: spacing.sm,
  },
  progress: {
    textAlign: 'right',
  },
});
