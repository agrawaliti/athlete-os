/**
 * <NumericInput> primitive
 *
 * Purpose-built for weight and rep entry during workouts.
 * Large centered text, numeric keyboard, tap-to-focus.
 * This is THE most-used component in the app — it must be fast.
 *
 * Usage: <NumericInput value={weight} onChangeValue={setWeight} label="kg" />
 */
import React, { memo, useRef } from 'react';
import {
  TextInput,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface NumericInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  label?: string;
  placeholder?: string;
  size?: 'weight' | 'reps';
}

export const NumericInput = memo(function NumericInput({
  value,
  onChangeValue,
  label,
  placeholder = '0',
  size = 'weight',
}: NumericInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      style={styles.container}
    >
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={[
          styles.input,
          size === 'weight' ? typography.weightInput : typography.repInput,
          { color: colors.textPrimary },
        ]}
      />
      {label && (
        <Text variant="caption" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minWidth: 56,
    flex: 1,
  },
  input: {
    textAlign: 'center',
    padding: 0,
    minWidth: 40,
    width: '100%',
  },
  label: {
    marginTop: spacing.xs,
  },
});
