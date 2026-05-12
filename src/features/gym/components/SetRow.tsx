/**
 * SetRow Component
 *
 * One row per set inside an ExerciseCard. Shows:
 * - Set number
 * - Weight input (pre-filled with suggestion)
 * - Rep input
 * - Complete button or checkmark
 *
 * Completed sets show as a green-tinted row.
 * Active set has editable inputs.
 */
import React, { memo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, NumericInput } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';

interface SetRowProps {
  setNumber: number;
  suggestedWeight: number;
  suggestedReps: string; // "6-8"
  isCompleted: boolean;
  completedWeight?: number;
  completedReps?: number;
  onLogSet: (weight: number, reps: number) => void;
}

export const SetRow = memo(function SetRow({
  setNumber,
  suggestedWeight,
  suggestedReps,
  isCompleted,
  completedWeight,
  completedReps,
  onLogSet,
}: SetRowProps) {
  const [weight, setWeight] = useState(
    isCompleted ? String(completedWeight) : suggestedWeight > 0 ? String(suggestedWeight) : ''
  );
  const [reps, setReps] = useState(
    isCompleted ? String(completedReps) : ''
  );

  const handleLog = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return;
    onLogSet(w, r);
  };

  if (isCompleted) {
    return (
      <View style={[styles.row, styles.completedRow]}>
        <Text variant="caption" color="textSecondary" style={styles.setLabel}>
          Set {setNumber}
        </Text>
        <Text variant="bodyBold" style={styles.completedText}>
          {completedWeight}kg
        </Text>
        <Text variant="bodyBold" style={styles.completedText}>
          × {completedReps}
        </Text>
        <Text style={styles.checkmark}>✓</Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.activeRow]}>
      <Text variant="caption" color="textSecondary" style={styles.setLabel}>
        Set {setNumber}
      </Text>
      <View style={styles.inputGroup}>
        <NumericInput
          value={weight}
          onChangeValue={setWeight}
          label="kg"
          size="reps"
        />
        <Text variant="body" color="textTertiary" style={styles.times}>
          ×
        </Text>
        <NumericInput
          value={reps}
          onChangeValue={setReps}
          label="reps"
          placeholder={suggestedReps}
          size="reps"
        />
      </View>
      <Pressable
        onPress={handleLog}
        style={({ pressed }) => [
          styles.logButton,
          pressed && styles.logButtonPressed,
        ]}
      >
        <Text variant="bodyBold" color="textPrimary">
          LOG
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  activeRow: {
    backgroundColor: colors.surfaceElevated,
  },
  completedRow: {
    backgroundColor: 'rgba(48, 209, 88, 0.08)',
  },
  setLabel: {
    width: 44,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  times: {
    marginHorizontal: spacing.xs,
  },
  completedText: {
    marginRight: spacing.md,
    color: colors.textPrimary,
  },
  checkmark: {
    fontSize: 18,
    color: colors.success,
    marginLeft: 'auto',
  },
  logButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  logButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
