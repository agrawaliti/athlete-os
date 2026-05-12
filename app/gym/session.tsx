/**
 * Workout Session Screen
 *
 * THE core screen. Shows exercise cards in a scrollable list.
 * Each card has set logging, previous performance, and progression hints.
 * Supersets are visually grouped.
 * Rest timer floats at the bottom.
 * Header shows elapsed time and total volume.
 *
 * Flow: user scrolls through exercises, logs sets, sees progress in real-time.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text, Button } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';
import { ExerciseCard, SupersetGroup, RestTimer } from '@/features/gym/components';
import { useWorkoutSessionStore } from '@/core/stores/workoutSessionStore';
import { workoutRepo } from '@/core/repositories';
import { calculateProgression } from '@/core/services/progressionEngine';
import { TemplateExerciseWithDetails, ProgressionSuggestion } from '@/types/global';

export default function SessionScreen() {
  const router = useRouter();
  const { templateId, templateName } = useLocalSearchParams<{
    templateId: string;
    templateName: string;
  }>();

  const { isActive, startSession, completeSession, getTotalVolume, getElapsedMinutes, startRestTimer, undoLastSet, completedSets } =
    useWorkoutSessionStore();

  const [exercises, setExercises] = useState<TemplateExerciseWithDetails[]>([]);
  const [suggestions, setSuggestions] = useState<Map<string, ProgressionSuggestion>>(new Map());
  const [elapsed, setElapsed] = useState(0);

  // Load template and start session
  useEffect(() => {
    if (!templateId || isActive) return;

    const template = workoutRepo.getTemplateWithExercises(templateId);
    if (!template) return;

    setExercises(template.exercises);
    startSession(templateId, templateName ?? template.name);

    // Calculate progression suggestions for each exercise
    const suggMap = new Map<string, ProgressionSuggestion>();
    for (const te of template.exercises) {
      const suggestion = calculateProgression({
        exerciseId: te.exerciseId,
        templateExercise: te,
      });
      suggMap.set(te.exerciseId, suggestion);
    }
    setSuggestions(suggMap);
  }, [templateId]);

  // Elapsed time ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedMinutes());
    }, 30000); // update every 30s
    return () => clearInterval(interval);
  }, []);

  // Group exercises: standalone vs supersets
  const exerciseGroups = useMemo(() => {
    const groups: { key: string; supersetGroup: string | null; exercises: TemplateExerciseWithDetails[] }[] = [];
    let currentSuperset: string | null = null;
    let currentGroup: TemplateExerciseWithDetails[] = [];

    for (const ex of exercises) {
      if (ex.supersetGroup) {
        if (ex.supersetGroup === currentSuperset) {
          currentGroup.push(ex);
        } else {
          if (currentGroup.length > 0) {
            groups.push({ key: currentSuperset!, supersetGroup: currentSuperset, exercises: currentGroup });
          }
          currentSuperset = ex.supersetGroup;
          currentGroup = [ex];
        }
      } else {
        if (currentGroup.length > 0) {
          groups.push({ key: currentSuperset!, supersetGroup: currentSuperset, exercises: currentGroup });
          currentGroup = [];
          currentSuperset = null;
        }
        groups.push({ key: ex.id, supersetGroup: null, exercises: [ex] });
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ key: currentSuperset!, supersetGroup: currentSuperset, exercises: currentGroup });
    }

    return groups;
  }, [exercises]);

  const handleFinish = () => {
    Alert.alert(
      'Finish Workout?',
      'This will complete your session and save all data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: () => {
            const result = completeSession();
            router.replace({
              pathname: '/gym/summary',
              params: {
                sessionId: result.id,
                volume: String(Math.round(result.totalVolume)),
                sets: String(result.totalSets),
                duration: String(result.duration),
                templateName: result.templateName,
                prCount: String(result.prs.length),
              },
            });
          },
        },
      ]
    );
  };

  const handleRestTimer = (seconds: number) => {
    startRestTimer(seconds);
  };

  const handleUndo = () => {
    if (completedSets.length === 0) return;
    undoLastSet();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const totalVolume = getTotalVolume();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h2">{templateName}</Text>
          <Text variant="caption" color="textSecondary">
            {elapsed > 0 ? `${elapsed} min` : 'Just started'} · {Math.round(totalVolume).toLocaleString()} kg volume
          </Text>
        </View>
        <View style={styles.headerActions}>
          {completedSets.length > 0 && (
            <Button title="Undo" variant="ghost" size="sm" onPress={handleUndo} />
          )}
          <Button title="Finish" variant="primary" size="sm" onPress={handleFinish} />
        </View>
      </View>

      {/* Exercise list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exerciseGroups.map((group) => {
          if (group.supersetGroup) {
            return (
              <SupersetGroup key={group.key} groupLabel={group.supersetGroup}>
                {group.exercises.map((te) => (
                  <ExerciseCard
                    key={te.id}
                    templateExercise={te}
                    suggestion={suggestions.get(te.exerciseId) ?? buildDefaultSuggestion(te)}
                    onRestTimer={handleRestTimer}
                  />
                ))}
              </SupersetGroup>
            );
          }

          const te = group.exercises[0];
          return (
            <ExerciseCard
              key={te.id}
              templateExercise={te}
              suggestion={suggestions.get(te.exerciseId) ?? buildDefaultSuggestion(te)}
              onRestTimer={handleRestTimer}
            />
          );
        })}

        {/* Bottom spacer for rest timer */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Floating rest timer */}
      <RestTimer />
    </SafeAreaView>
  );
}

function buildDefaultSuggestion(te: TemplateExerciseWithDetails): ProgressionSuggestion {
  return {
    exerciseId: te.exerciseId,
    previousWeight: 0,
    previousReps: 0,
    suggestedWeight: 0,
    suggestedRepsMin: te.targetRepsMin,
    suggestedRepsMax: te.targetRepsMax,
    reasoning: 'first_session',
    confidence: 'low',
  };
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
    paddingVertical: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
});
