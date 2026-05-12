/**
 * AthleteOS Color Palette
 *
 * Dark-mode first. Inspired by Apple's HIG dark palette.
 * Every color has a semantic purpose — no random hex values in components.
 */
export const colors = {
  // ━━━ Backgrounds ━━━
  background: '#0A0A0B',
  surface: '#141416',
  surfaceElevated: '#1C1C1F',

  // ━━━ Text ━━━
  textPrimary: '#F5F5F7',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // ━━━ Accent ━━━
  primary: '#6C5CE7',
  primaryMuted: 'rgba(108, 92, 231, 0.12)',

  // ━━━ Semantic ━━━
  success: '#34C759',
  warning: '#FF9F0A',
  destructive: '#FF453A',

  // ━━━ Workout-specific ━━━
  pr: '#FFD60A',
  improvement: '#30D158',
  maintain: '#8E8E93',
  deload: '#FF9F0A',

  // ━━━ Borders ━━━
  border: '#2C2C2E',
  borderSubtle: '#1C1C1E',
} as const;

export type ColorKey = keyof typeof colors;
