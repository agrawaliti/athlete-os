/**
 * <Badge> primitive
 *
 * Small status indicators: PR!, ↑, →, deload
 * Used on exercise cards to show progression direction.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

type BadgeType = 'pr' | 'improvement' | 'maintain' | 'deload';

interface BadgeProps {
  type: BadgeType;
  label?: string;
}

const BADGE_CONFIG: Record<BadgeType, { bg: string; text: string; defaultLabel: string }> = {
  pr: { bg: 'rgba(255, 214, 10, 0.15)', text: colors.pr, defaultLabel: '🏆 PR!' },
  improvement: { bg: 'rgba(48, 209, 88, 0.15)', text: colors.improvement, defaultLabel: '↑' },
  maintain: { bg: 'rgba(142, 142, 147, 0.15)', text: colors.maintain, defaultLabel: '→' },
  deload: { bg: 'rgba(255, 159, 10, 0.15)', text: colors.deload, defaultLabel: '↓ deload' },
};

export const Badge = memo(function Badge({ type, label }: BadgeProps) {
  const config = BADGE_CONFIG[type];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text
        variant="caption"
        style={[styles.text, { color: config.text }]}
      >
        {label ?? config.defaultLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
