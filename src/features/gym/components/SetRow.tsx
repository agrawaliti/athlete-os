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
        <View style={styles.setNumBadge}>
          <Text variant="caption" style={styles.setNumText}>{setNumber}</Text>
        </View>
        <Text variant="body" style={styles.completedWeight}>
          {completedWeight} kg
        </Text>
        <Text variant="body" style={styles.completedReps}>
          × {completedReps}
        </Text>
        <View style={styles.checkBadge}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.activeRow]}>
      <View style={[styles.setNumBadge, styles.setNumBadgeActive]}>
        <Text variant="caption" style={styles.setNumTextActive}>{setNumber}</Text>
      </View>
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
        <Pressable
          onPress={handleLog}
          style={({ pressed }) => [
            styles.logButton,
            pressed && styles.logButtonPressed,
          ]}
        >
          <Text variant="bodyBold" color="textPrimary" style={{ fontSize: 13 }}>
            LOG
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  activeRow: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedRow: {
    backgroundColor: colors.success + '0A',
  },
  setNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  setNumBadgeActive: {
    backgroundColor: colors.primary + '20',
  },
  setNumText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  setNumTextActive: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  times: {
    marginHorizontal: 2,
  },
  completedWeight: {
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  completedReps: {
    color: colors.textSecondary,
    flex: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '700',
  },
  logButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
  },
  logButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
