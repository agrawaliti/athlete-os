/**
 * SupersetGroup Component
 *
 * Visually groups exercises that are performed back-to-back.
 * Wraps multiple ExerciseCards in a bordered container with a label.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';

interface SupersetGroupProps {
  groupLabel: string;
  children: React.ReactNode;
}

export const SupersetGroup = memo(function SupersetGroup({
  groupLabel,
  children,
}: SupersetGroupProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text variant="label" color="primary">
          ⚡ SUPERSET {groupLabel}
        </Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.primary + '30', // 30% opacity
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  labelContainer: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.sm,
  },
});
