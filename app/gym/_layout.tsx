import { Stack } from 'expo-router';
import { colors } from '@/ui/theme';

export default function GymLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
        animation: 'default',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="select-workout" options={{ title: 'Select Workout' }} />
      <Stack.Screen name="plan" options={{ title: 'Workout Plan', headerBackTitle: 'Back' }} />
      <Stack.Screen name="session" options={{ title: '', headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="history" options={{ title: 'History' }} />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Summary',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
