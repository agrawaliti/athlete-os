/**
 * Workout Session Screen — Accordion Style
 *
 * Shows one superset expanded at a time with exercises to log.
 * After completing all sets in a group, auto-advances to next.
 * Floating rest timer at bottom. Progress bar at top.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Text } from '@/ui/primitives';
import { colors, spacing, radius } from '@/ui/theme';
import { ExerciseCard, RestTimer } from '@/features/gym/components';
import { useWorkoutSessionStore } from '@/core/stores/workoutSessionStore';
import { workoutRepo } from '@/core/repositories';
import { calculateProgression } from '@/core/services/progressionEngine';
import { TemplateExerciseWithDetails, ProgressionSuggestion } from '@/types/global';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExerciseGroup {
  key: string;
  label: string;
  exercises: TemplateExerciseWithDetails[];
}

export default function SessionScreen() {
  const router = useRouter();
  const { templateId, templateName } = useLocalSearchParams<{
    templateId: string;
    templateName: string;
  }>();

  const isActive = useWorkoutSessionStore((s) => s.isActive);
  const startSession = useWorkoutSessionStore((s) => s.startSession);
  const completeSession = useWorkoutSessionStore((s) => s.completeSession);
  const getTotalVolume = useWorkoutSessionStore((s) => s.getTotalVolume);
  const getElapsedMinutes = useWorkoutSessionStore((s) => s.getElapsedMinutes);
  const startRestTimer = useWorkoutSessionStore((s) => s.startRestTimer);
  const undoLastSet = useWorkoutSessionStore((s) => s.undoLastSet);
  const completedSets = useWorkoutSessionStore((s) => s.completedSets);
  const abandonSession = useWorkoutSessionStore((s) => s.abandonSession);
  const activeTemplateId = useWorkoutSessionStore((s) => s.templateId);

  const [exercises, setExercises] = useState<TemplateExerciseWithDetails[]>([]);
  const [suggestions, setSuggestions] = useState<Map<string, ProgressionSuggestion>>(new Map());
  const [expandedGroup, setExpandedGroup] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Load template and start session
  useEffect(() => {
    if (!templateId) return;

    if (isActive && activeTemplateId !== templateId) {
      abandonSession();
    }
    if (isActive && activeTemplateId === templateId) {
      const template = workoutRepo.getTemplateWithExercises(templateId);
      if (template) setExercises(template.exercises);
      return;
    }

    const template = workoutRepo.getTemplateWithExercises(templateId);
    if (!template) return;

    setExercises(template.exercises);
    startSession(templateId, templateName ?? template.name);

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
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group exercises into supersets
  const exerciseGroups: ExerciseGroup[] = useMemo(() => {
    const groups: ExerciseGroup[] = [];
    let currentSuperset: string | null = null;
    let currentGroup: TemplateExerciseWithDetails[] = [];

    for (const ex of exercises) {
      if (ex.supersetGroup) {
        if (ex.supersetGroup === currentSuperset) {
          currentGroup.push(ex);
        } else {
          if (currentGroup.length > 0) {
            groups.push({ key: currentSuperset!, label: currentSuperset!, exercises: currentGroup });
          }
          currentSuperset = ex.supersetGroup;
          currentGroup = [ex];
        }
      } else {
        if (currentGroup.length > 0) {
          groups.push({ key: currentSuperset!, label: currentSuperset!, exercises: currentGroup });
          currentGroup = [];
          currentSuperset = null;
        }
        groups.push({ key: ex.id, label: ex.exercise.name, exercises: [ex] });
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ key: currentSuperset!, label: currentSuperset!, exercises: currentGroup });
    }

    return groups;
  }, [exercises]);

  // Check if a group is fully complete
  const isGroupComplete = useCallback((group: ExerciseGroup): boolean => {
    return group.exercises.every((te) => {
      const setsForExercise = completedSets.filter((s) => s.exerciseId === te.exerciseId);
      return setsForExercise.length >= te.targetSets;
    });
  }, [completedSets]);

  // Get completion count for a group
  const getGroupProgress = useCallback((group: ExerciseGroup): { done: number; total: number } => {
    let done = 0;
    let total = 0;
    for (const te of group.exercises) {
      const setsForExercise = completedSets.filter((s) => s.exerciseId === te.exerciseId);
      done += Math.min(setsForExercise.length, te.targetSets);
      total += te.targetSets;
    }
    return { done, total };
  }, [completedSets]);

  // Auto-advance when current group is complete
  useEffect(() => {
    if (exerciseGroups.length === 0) return;
    const currentGroup = exerciseGroups[expandedGroup];
    if (!currentGroup) return;

    if (isGroupComplete(currentGroup) && expandedGroup < exerciseGroups.length - 1) {
      // Delay slightly for user to see the completion
      const timer = setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedGroup(expandedGroup + 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [completedSets, expandedGroup, exerciseGroups]);

  // Overall progress
  const overallProgress = useMemo(() => {
    if (exercises.length === 0) return 0;
    let totalSets = 0;
    let completedCount = 0;
    for (const te of exercises) {
      totalSets += te.targetSets;
      const done = completedSets.filter((s) => s.exerciseId === te.exerciseId).length;
      completedCount += Math.min(done, te.targetSets);
    }
    return totalSets > 0 ? completedCount / totalSets : 0;
  }, [exercises, completedSets]);

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

  const toggleGroup = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroup(index);
  };

  const totalVolume = getTotalVolume();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitle}>
            <Text variant="h3" numberOfLines={1}>{templateName}</Text>
            <Text variant="caption" color="textSecondary">
              {elapsed > 0 ? `${elapsed} min` : 'Just started'} · {Math.round(totalVolume).toLocaleString()} kg
            </Text>
          </View>
          <View style={styles.headerActions}>
            {completedSets.length > 0 && (
              <Pressable onPress={handleUndo} style={styles.undoBtn}>
                <Text variant="caption" color="primary">Undo</Text>
              </Pressable>
            )}
            <Pressable onPress={handleFinish} style={styles.finishBtn}>
              <Text variant="bodyBold" style={styles.finishBtnText}>Finish</Text>
            </Pressable>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${overallProgress * 100}%` }]} />
        </View>
      </View>

      {/* Accordion groups */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {exerciseGroups.map((group, index) => {
          const isExpanded = index === expandedGroup;
          const complete = isGroupComplete(group);
          const progress = getGroupProgress(group);

          return (
            <View key={group.key} style={[styles.groupContainer, complete && styles.groupComplete]}>
              {/* Group header - tap to expand */}
              <Pressable
                onPress={() => toggleGroup(index)}
                style={[styles.groupHeader, isExpanded && styles.groupHeaderActive]}
              >
                <View style={styles.groupHeaderLeft}>
                  <View style={[styles.groupIndicator, complete ? styles.indicatorComplete : isExpanded ? styles.indicatorActive : styles.indicatorDefault]} />
                  <View>
                    <Text variant="bodyBold" color={complete ? 'success' : 'textPrimary'}>
                      {group.label.startsWith('solo_') ? group.exercises[0].exercise.name : `Superset ${group.label}`}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {group.exercises.map((e) => e.exercise.name).join(' + ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.groupHeaderRight}>
                  <Text variant="caption" color={complete ? 'success' : 'textSecondary'}>
                    {complete ? '✓' : `${progress.done}/${progress.total}`}
                  </Text>
                </View>
              </Pressable>

              {/* Expanded content */}
              {isExpanded && (
                <View style={styles.groupContent}>
                  {group.exercises.map((te) => (
                    <ExerciseCard
                      key={te.id}
                      templateExercise={te}
                      suggestion={suggestions.get(te.exerciseId) ?? buildDefaultSuggestion(te)}
                      onRestTimer={handleRestTimer}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 120 }} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  undoBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  finishBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  finishBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.success,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  groupContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  groupComplete: {
    borderColor: colors.success + '40',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  groupHeaderActive: {
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  groupHeaderRight: {
    marginLeft: spacing.sm,
  },
  groupIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorDefault: {
    backgroundColor: colors.textTertiary,
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
  indicatorComplete: {
    backgroundColor: colors.success,
  },
  groupContent: {
    padding: spacing.md,
  },
});
