/**
 * <Text> primitive
 *
 * Wraps RN Text with our typography variants and theme colors.
 * Usage: <Text variant="h1">Title</Text>
 *        <Text variant="caption" color="textSecondary">Subtitle</Text>
 */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, TypographyVariant } from '../theme/typography';
import { colors, ColorKey } from '../theme/colors';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorKey;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  children,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        { color: colors[color] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
