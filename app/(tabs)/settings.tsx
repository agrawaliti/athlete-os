/**
 * Settings Screen — placeholder.
 * Will contain: weight unit toggle, rest timer default, data export.
 */
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1">Settings</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Preferences coming soon.
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
  },
});
