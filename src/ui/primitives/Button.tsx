/**
 * <Button> primitive
 *
 * Three variants: primary (filled), secondary (outlined), ghost (text only).
 * Minimum 48px hit target for gym-friendly tap zones.
 *
 * Usage: <Button title="Log Set" onPress={handleLog} />
 *        <Button title="Cancel" variant="ghost" onPress={handleCancel} />
 */
import React, { memo } from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 44, lg: 52 };

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        { height: HEIGHT[size], minHeight: size === 'sm' ? HEIGHT[size] : 48 },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} size="small" />
      ) : (
        <Text
          variant="bodyBold"
          color={variant === 'primary' ? 'textPrimary' : 'primary'}
          style={isDisabled ? { opacity: 0.5 } : undefined}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.4,
  },
});
