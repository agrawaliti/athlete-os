import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { colors } from '@/ui/theme';

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full_body';

interface BodyFigureProps {
  highlightedMuscle: MuscleGroup;
  size?: number;
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: '#FF6B6B',
  back: '#4ECDC4',
  legs: '#45B7D1',
  shoulders: '#FFA07A',
  arms: '#DDA0DD',
  core: '#FFD93D',
  full_body: '#98D8C8',
};

/**
 * Minimalist female body figure with highlighted muscle groups.
 * Clean line-art style with colored muscle regions.
 */
export const BodyFigure = React.memo(({ highlightedMuscle, size = 120 }: BodyFigureProps) => {
  const muscleColor = MUSCLE_COLORS[highlightedMuscle] || MUSCLE_COLORS.full_body;
  const baseColor = colors.textTertiary + '40';

  return (
    <Svg width={size} height={size * 1.8} viewBox="0 0 100 180">
      {/* Head */}
      <Path
        d="M44 8 C44 3, 56 3, 56 8 C56 14, 56 18, 50 20 C44 18, 44 14, 44 8Z"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.5}
      />

      {/* Neck */}
      <Path
        d="M47 20 L47 24 L53 24 L53 20"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.5}
      />

      {/* Shoulders */}
      <G opacity={highlightedMuscle === 'shoulders' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        <Path
          d="M37 26 C34 26, 30 28, 29 32 L37 32 Z"
          fill={highlightedMuscle === 'shoulders' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
        <Path
          d="M63 26 C66 26, 70 28, 71 32 L63 32 Z"
          fill={highlightedMuscle === 'shoulders' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Chest */}
      <G opacity={highlightedMuscle === 'chest' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        <Path
          d="M37 26 L37 44 C37 46, 42 48, 50 48 C58 48, 63 46, 63 44 L63 26 C58 24, 42 24, 37 26Z"
          fill={highlightedMuscle === 'chest' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Core / Abs */}
      <G opacity={highlightedMuscle === 'core' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        <Path
          d="M40 48 L40 72 C40 74, 44 76, 50 76 C56 76, 60 74, 60 72 L60 48 C56 50, 44 50, 40 48Z"
          fill={highlightedMuscle === 'core' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Back (shown as upper back area visible from front as traps) */}
      <G opacity={highlightedMuscle === 'back' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        <Path
          d="M37 26 C39 30, 39 34, 37 38 L37 26Z"
          fill={highlightedMuscle === 'back' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.3}
        />
        <Path
          d="M63 26 C61 30, 61 34, 63 38 L63 26Z"
          fill={highlightedMuscle === 'back' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.3}
        />
      </G>

      {/* Arms - Upper */}
      <G opacity={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        {/* Left arm */}
        <Path
          d="M29 32 C27 36, 25 44, 24 52 L28 52 C29 44, 31 38, 33 34 L29 32Z"
          fill={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
        {/* Right arm */}
        <Path
          d="M71 32 C73 36, 75 44, 76 52 L72 52 C71 44, 69 38, 67 34 L71 32Z"
          fill={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Arms - Forearms */}
      <G opacity={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        <Path
          d="M24 52 C23 58, 22 64, 21 70 L24 70 C25 64, 26 58, 28 52Z"
          fill={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
        <Path
          d="M76 52 C77 58, 78 64, 79 70 L76 70 C75 64, 74 58, 72 52Z"
          fill={highlightedMuscle === 'arms' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Hips / Glutes transition */}
      <Path
        d="M40 72 C38 74, 36 76, 35 80 L65 80 C64 76, 62 74, 60 72 C56 74, 44 74, 40 72Z"
        fill={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? muscleColor + '80' : baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.5}
      />

      {/* Legs - Thighs */}
      <G opacity={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        {/* Left thigh */}
        <Path
          d="M35 80 C34 88, 34 96, 35 108 L42 108 C43 96, 44 88, 45 80Z"
          fill={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
        {/* Right thigh */}
        <Path
          d="M55 80 C56 88, 57 96, 58 108 L65 108 C66 96, 66 88, 65 80Z"
          fill={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Legs - Calves */}
      <G opacity={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? 1 : 0.6}>
        {/* Left calf */}
        <Path
          d="M35 108 C35 120, 35 132, 36 145 L41 145 C41 132, 42 120, 42 108Z"
          fill={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
        {/* Right calf */}
        <Path
          d="M58 108 C58 120, 58 132, 59 145 L64 145 C64 132, 65 120, 65 108Z"
          fill={highlightedMuscle === 'legs' || highlightedMuscle === 'full_body' ? muscleColor : baseColor}
          stroke={colors.textTertiary}
          strokeWidth={0.5}
        />
      </G>

      {/* Feet */}
      <Path
        d="M34 145 L34 150 C34 152, 42 152, 42 150 L42 145"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.5}
      />
      <Path
        d="M58 145 L58 150 C58 152, 66 152, 66 150 L66 145"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.5}
      />

      {/* Hands */}
      <Path
        d="M19 70 C19 72, 21 74, 23 73 L24 70Z"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.4}
      />
      <Path
        d="M81 70 C81 72, 79 74, 77 73 L76 70Z"
        fill={baseColor}
        stroke={colors.textTertiary}
        strokeWidth={0.4}
      />
    </Svg>
  );
});
