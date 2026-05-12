/**
 * Home Screen
 *
 * The landing screen. Shows activity cards (Gym, BJJ, Swimming, Analytics).
 * Only Gym is functional in MVP — others show "Coming Soon" state.
 *
 * This is what the user sees when they open the app.
 * Goal: one tap to start a workout.
 */
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';

interface ActivityCardData {
  title: string;
  emoji: string;
  subtitle: string;
  enabled: boolean;
  route?: string;
}

const ACTIVITIES: ActivityCardData[] = [
  { title: 'Gym', emoji: '🏋️', subtitle: 'Log your workout', enabled: true, route: '/gym/select-workout' },
  { title: 'History', emoji: '📋', subtitle: 'Past workouts', enabled: true, route: '/gym/history' },
  { title: 'Jiu-Jitsu', emoji: '🥋', subtitle: 'Coming soon', enabled: false },
  { title: 'Swimming', emoji: '🏊', subtitle: 'Coming soon', enabled: false },
  { title: 'Analytics', emoji: '📊', subtitle: 'View progress', enabled: true, route: '/(tabs)/analytics' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1" style={styles.greeting}>
          AthleteOS
        </Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          What are you training today?
        </Text>

        <View style={styles.grid}>
          {ACTIVITIES.map((activity) => (
            <Card
              key={activity.title}
              elevated={activity.enabled}
              padding="xl"
              onPress={
                activity.enabled && activity.route
                  ? () => router.push(activity.route as any)
                  : undefined
              }
              style={[
                styles.activityCard,
                !activity.enabled && styles.disabledCard,
              ]}
            >
              <Text style={styles.emoji}>{activity.emoji}</Text>
              <Text variant="h3" style={styles.cardTitle}>
                {activity.title}
              </Text>
              <Text variant="caption" color="textSecondary">
                {activity.subtitle}
              </Text>
            </Card>
          ))}
        </View>
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
  },
  greeting: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  activityCard: {
    width: '47%',
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledCard: {
    opacity: 0.4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
});
