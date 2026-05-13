/**
 * ExerciseCard Component — Sporty Design
 *
 * Shows exercise info + set logging in an expandable card.
 * Progress bar, muscle group tag, previous performance.
 * Large tap targets for gym use.
 */
import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';
import { SetRow } from './SetRow';
import { AnimatedExerciseImage } from './AnimatedExerciseImage';
import { TemplateExerciseWithDetails, ProgressionSuggestion } from '@/types/global';
import { useWorkoutSessionStore } from '@/core/stores/workoutSessionStore';

interface ExerciseCardProps {
  templateExercise: TemplateExerciseWithDetails;
  suggestion: ProgressionSuggestion;
  onRestTimer: (seconds: number) => void;
}

const muscleColors: Record<string, string> = {
  back: '#4ECDC4',
  hamstrings: '#FF6B6B',
  glutes: '#FF6B6B',
  quads: '#FF6B6B',
  chest: '#45B7D1',
  shoulders: '#96CEB4',
  triceps: '#45B7D1',
  biceps: '#4ECDC4',
  core: '#FFEAA7',
  forearms: '#DDA0DD',
  full_body: '#FFD93D',
  grip: '#DDA0DD',
  neck: '#B8B8B8',
  conditioning: '#FF9F43',
};

export const ExerciseCard = memo(function ExerciseCard({
  templateExercise,
  suggestion,
  onRestTimer,
}: ExerciseCardProps) {
  const { exercise } = templateExercise;
  const allCompletedSets = useWorkoutSessionStore((s) => s.completedSets);
  const logSet = useWorkoutSessionStore((s) => s.logSet);
  const completedSets = useMemo(
    () => allCompletedSets.filter((set) => set.exerciseId === exercise.id),
    [allCompletedSets, exercise.id]
  );

  const totalSetsTarget = templateExercise.targetSets;
  const allSetsComplete = completedSets.length >= totalSetsTarget;
  const progress = totalSetsTarget > 0 ? Math.min(completedSets.length / totalSetsTarget, 1) : 0;
  const muscleColor = muscleColors[exercise.muscleGroup] ?? colors.textSecondary;

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

  return (
    <View style={[styles.card, allSetsComplete && styles.completedCard]}>
      {/* Header with muscle tag */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text variant="bodyBold" style={styles.exerciseName}>{exercise.name}</Text>
          <View style={[styles.muscleTag, { backgroundColor: muscleColor + '20' }]}>
            <Text variant="caption" style={{ color: muscleColor, fontSize: 11 }}>
              {exercise.muscleGroup.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Animated exercise illustration */}
        <AnimatedExerciseImage exerciseName={exercise.name} muscleGroup={exercise.muscleGroup} />

        {/* Previous + target info */}
        <View style={styles.infoRow}>
          {suggestion.previousWeight > 0 ? (
            <Text variant="caption" color="textSecondary">
              Last: {suggestion.previousWeight}kg × {suggestion.previousReps}
            </Text>
          ) : (
            <Text variant="caption" color="textTertiary">First time</Text>
          )}
          <Text variant="caption" color="textTertiary">
            Target: {totalSetsTarget} × {templateExercise.targetRepsMin}-{templateExercise.targetRepsMax}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: allSetsComplete ? colors.success : muscleColor }]} />
        </View>
      </View>

      {/* Set rows */}
      <View style={styles.setsContainer}>
        {setRows.map((row) => (
          <SetRow
            key={row.setNumber}
            setNumber={row.setNumber}
            suggestedWeight={suggestion.suggestedWeight || suggestion.previousWeight}
            suggestedReps={`${suggestion.previousReps || suggestion.suggestedRepsMax}`}
            isCompleted={row.isCompleted}
            completedWeight={row.completedWeight}
            completedReps={row.completedReps}
            onLogSet={handleLogSet}
          />
        ))}
      </View>

      {/* Completion badge */}
      {allSetsComplete && (
        <View style={styles.completeBadge}>
          <Text variant="caption" style={styles.completeBadgeText}>✓ Complete</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  completedCard: {
    borderColor: colors.success + '50',
    backgroundColor: colors.surface,
  },
  header: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  exerciseName: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  muscleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  setsContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  completeBadge: {
    backgroundColor: colors.success + '15',
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  completeBadgeText: {
    color: colors.success,
    fontWeight: '600',
    fontSize: 12,
  },
});
