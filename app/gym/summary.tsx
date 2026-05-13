/**
 * Workout Summary Screen
 *
 * Shown after completing a workout. Displays:
 * - Duration, total volume, sets completed
 * - PRs achieved (if any)
 * - Session rating (1-5)
 *
 * This is the "reward" screen — makes the user feel accomplished.
 */
import { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text, Card, Button } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';
import { workoutRepo } from '@/core/repositories';

export default function SummaryScreen() {
  const router = useRouter();
  const { sessionId, volume, sets, duration, templateName, prCount } = useLocalSearchParams<{
    sessionId: string;
    volume: string;
    sets: string;
    duration: string;
    templateName: string;
    prCount: string;
  }>();

  const [rating, setRating] = useState<number | null>(null);
  const prs = Number(prCount ?? 0);

  const handleRating = (value: number) => {
    setRating(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDone = () => {
    // Save rating if provided
    if (rating && sessionId) {
      workoutRepo.updateSession(sessionId, { rating });
    }
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text variant="h1" align="center" style={styles.title}>
          {templateName} Complete! 💪
        </Text>

        {/* PRs banner */}
        {prs > 0 && (
          <Card padding="lg" style={styles.prBanner}>
            <Text variant="h2" align="center">
              🏆
            </Text>
            <Text variant="h3" align="center" style={{ color: colors.pr }}>
              {prs} New PR{prs > 1 ? 's' : ''}!
            </Text>
          </Card>
        )}

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <Card padding="lg" style={styles.statCard}>
            <Text variant="h2" align="center" color="primary">
              {duration ?? '0'}
            </Text>
            <Text variant="caption" align="center" color="textSecondary">
              minutes
            </Text>
          </Card>

          <Card padding="lg" style={styles.statCard}>
            <Text variant="h2" align="center" color="primary">
              {Number(volume ?? 0).toLocaleString()}
            </Text>
            <Text variant="caption" align="center" color="textSecondary">
              kg volume
            </Text>
          </Card>

          <Card padding="lg" style={styles.statCard}>
            <Text variant="h2" align="center" color="primary">
              {sets ?? '0'}
            </Text>
            <Text variant="caption" align="center" color="textSecondary">
              sets
            </Text>
          </Card>
        </View>

        {/* Session rating */}
        <Card padding="lg" style={styles.ratingCard}>
          <Text variant="body" align="center" color="textSecondary" style={styles.ratingLabel}>
            How did it feel?
          </Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                onPress={() => handleRating(value)}
                style={[
                  styles.ratingButton,
                  rating === value && styles.ratingButtonActive,
                ]}
              >
                <Text
                  variant="h3"
                  align="center"
                  style={[
                    styles.ratingEmoji,
                    rating === value && styles.ratingEmojiActive,
                  ]}
                >
                  {['😵', '😮‍💨', '😐', '💪', '🔥'][value - 1]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text variant="caption" align="center" color="textTertiary">
            {rating ? ['Brutal', 'Tough', 'Okay', 'Strong', 'On fire'][rating - 1] : 'Tap to rate'}
          </Text>
        </Card>

        {/* Encouragement */}
        <Card padding="xl" style={styles.encouragement}>
          <Text variant="body" align="center" color="textSecondary">
            Great work. Consistency beats intensity. See you next session. 🔥
          </Text>
        </Card>

        {/* Done button */}
        <Button
          title="Done"
          onPress={handleDone}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  title: {
    marginBottom: spacing.xl,
  },
  prBanner: {
    marginBottom: spacing.xl,
    borderColor: 'rgba(255, 214, 10, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  ratingCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  ratingLabel: {
    marginBottom: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  ratingButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  ratingEmoji: {
    fontSize: 22,
  },
  ratingEmojiActive: {
    fontSize: 26,
  },
  encouragement: {
    marginBottom: spacing.xxl,
  },
});
