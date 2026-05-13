import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, spacing } from '@/ui/theme';
import { getExerciseGifUrl } from '@/utils/exerciseImages';

interface AnimatedExerciseImageProps {
  exerciseName: string;
  muscleGroup?: string;
}

/**
 * Hevy-style animated exercise illustration — shows an animated GIF
 * of the exercise movement on a clean white background.
 */
export const AnimatedExerciseImage = React.memo(({ exerciseName }: AnimatedExerciseImageProps) => {
  const gifUrl = getExerciseGifUrl(exerciseName);

  if (!gifUrl) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: gifUrl }}
        style={styles.gif}
        contentFit="contain"
        autoplay={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    marginVertical: spacing.xs,
  },
  gif: {
    width: '100%',
    height: 180,
  },
});
