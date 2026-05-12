/**
 * Root Layout
 *
 * This is the entry point of the app. It:
 * 1. Initializes the database + runs migrations
 * 2. Seeds default data on first launch
 * 3. Wraps everything in providers (theme, safe area)
 * 4. Defines the root navigation stack
 *
 * The gym workout flow opens as a full-screen modal — no tab bar
 * visible during active workouts to keep the user focused.
 */
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@/core/db/client';
import { runMigrations } from '@/core/db/schema';
import { seedDatabase } from '@/core/db/seed';
import { colors } from '@/ui/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Initialize database on app start
    const db = getDatabase();
    runMigrations(db);
    seedDatabase();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="gym"
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false, // prevent accidental swipe during workout
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
