/**
 * AthleteOS Typography
 *
 * Uses system font (San Francisco on iOS, Roboto on Android).
 * tabular-nums on weight/rep displays so numbers don't shift horizontally.
 */
import { TextStyle } from 'react-native';

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontSize: 18,
    fontWeight: '600',
  } as TextStyle,

  body: {
    fontSize: 16,
    fontWeight: '400',
  } as TextStyle,

  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  caption: {
    fontSize: 13,
    fontWeight: '400',
  } as TextStyle,

  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // Large numeric inputs during workout logging
  weightInput: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  repInput: {
    fontSize: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
