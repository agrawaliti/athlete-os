/**
 * <Card> primitive
 *
 * The primary container component. Dark surface with rounded corners.
 * Optionally pressable with scale animation for tap feedback.
 *
 * Usage: <Card>content</Card>
 *        <Card elevated onPress={handleTap}>tappable</Card>
 */
import React, { memo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius, shadows, SpacingKey } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  padding?: SpacingKey;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Card = memo(function Card({
  children,
  elevated = false,
  padding = 'lg',
  onPress,
  style,
}: CardProps) {
  const cardStyle = [
    styles.card,
    elevated && shadows.elevated,
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
