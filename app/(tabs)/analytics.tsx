/**
 * Analytics Screen — placeholder for MVP.
 * Will contain: PR timeline, consistency, exercise progression, volume charts.
 */
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1">Analytics</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Complete a few workouts to see your progress here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
