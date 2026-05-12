/**
 * Select Workout Screen
 *
 * User picks their workout day (Pull, Push, Legs, etc.).
 * Shows template cards with exercise count + estimated duration.
 * Tapping one starts the workout session.
 */
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';
import { workoutRepo } from '@/core/repositories';
import { WorkoutTemplate } from '@/types/global';
import { useEffect, useState } from 'react';

export default function SelectWorkoutScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useEffect(() => {
    setTemplates(workoutRepo.getAllTemplates());
  }, []);

  const handleSelectTemplate = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/gym/session',
      params: { templateId: template.id, templateName: template.name },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="h1">What are you training?</Text>
        <Text variant="body" color="textSecondary" style={styles.subtitle}>
          Pick your workout or go freestyle.
        </Text>

        <View style={styles.list}>
          {templates.map((template) => (
            <Card
              key={template.id}
              elevated
              padding="lg"
              onPress={() => handleSelectTemplate(template)}
              style={styles.templateCard}
            >
              <Text variant="h3">{template.name}</Text>
              <Text variant="caption" color="textSecondary">
                {template.category} • ~{template.estimatedDuration ?? 45} min
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
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  list: {
    gap: spacing.md,
  },
  templateCard: {
    width: '100%',
  },
});
