/**
 * Workout History Screen
 *
 * Shows past workout sessions in reverse chronological order.
 * Each card shows: template name, date, duration, volume, sets, rating.
 */
import { useMemo } from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';
import { workoutRepo } from '@/core/repositories';
import { WorkoutSession } from '@/types/global';

const RATING_EMOJIS = ['😵', '😮‍💨', '😐', '💪', '🔥'];

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function SessionCard({ session }: { session: WorkoutSession }) {
  return (
    <Card padding="lg" style={styles.sessionCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text variant="h3">{session.templateName}</Text>
          {session.rating ? (
            <Text style={styles.ratingEmoji}>
              {RATING_EMOJIS[session.rating - 1]}
            </Text>
          ) : null}
        </View>
        <Text variant="caption" color="textTertiary">
          {formatDate(session.startedAt)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text variant="bodyBold" color="primary">
            {session.duration ?? 0}
          </Text>
          <Text variant="caption" color="textTertiary">min</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text variant="bodyBold" color="primary">
            {Math.round(session.totalVolume).toLocaleString()}
          </Text>
          <Text variant="caption" color="textTertiary">kg</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text variant="bodyBold" color="primary">
            {session.totalSets}
          </Text>
          <Text variant="caption" color="textTertiary">sets</Text>
        </View>
      </View>
    </Card>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const sessions = useMemo(() => workoutRepo.getRecentSessions(50), []);

  const completedSessions = sessions.filter((s) => s.completedAt !== null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Back"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
        />
        <Text variant="h2">Workout History</Text>
        <View style={{ width: 60 }} />
      </View>

      {completedSessions.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="body" color="textTertiary" align="center">
            No workouts yet. Hit the gym! 🏋️
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SessionCard session={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  list: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  sessionCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingEmoji: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
});
