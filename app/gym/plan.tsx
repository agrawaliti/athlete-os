/**
 * Plan Overview Screen
 *
 * Shows the workout structure before starting:
 * - Supersets as cards with exercise names, sets×reps, muscle tags
 * - Estimated time per superset
 * - Previous performance hints
 * - "Start Workout" button
 */
import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '@/ui/primitives';
import { colors, spacing } from '@/ui/theme';
import { radius } from '@/ui/theme/spacing';
import { workoutRepo } from '@/core/repositories';
import { TemplateExerciseWithDetails, WorkoutTemplateWithExercises } from '@/types/global';

interface SupersetPlan {
  group: string;
  exercises: TemplateExerciseWithDetails[];
  estimatedMinutes: number;
  totalSets: number;
}

export default function PlanScreen() {
  const router = useRouter();
  const { templateId, templateName } = useLocalSearchParams<{
    templateId: string;
    templateName: string;
  }>();

  const [template, setTemplate] = useState<WorkoutTemplateWithExercises | null>(null);

  useEffect(() => {
    if (!templateId) return;
    const t = workoutRepo.getTemplateWithExercises(templateId);
    setTemplate(t);
  }, [templateId]);

  const supersetPlans = useMemo((): SupersetPlan[] => {
    if (!template) return [];

    const groups: SupersetPlan[] = [];
    let currentGroup: string | null = null;
    let currentExercises: TemplateExerciseWithDetails[] = [];

    for (const ex of template.exercises) {
      const group = ex.supersetGroup || `solo_${ex.id}`;
      if (group !== currentGroup) {
        if (currentExercises.length > 0 && currentGroup) {
          const totalSets = currentExercises.reduce((sum, e) => sum + e.targetSets, 0);
          const avgRest = currentExercises.reduce((sum, e) => sum + e.restSeconds, 0) / currentExercises.length;
          const estimatedMinutes = Math.ceil((totalSets * (30 + avgRest)) / 60);
          groups.push({ group: currentGroup, exercises: currentExercises, estimatedMinutes, totalSets });
        }
        currentGroup = group;
        currentExercises = [ex];
      } else {
        currentExercises.push(ex);
      }
    }
    if (currentExercises.length > 0 && currentGroup) {
      const totalSets = currentExercises.reduce((sum, e) => sum + e.targetSets, 0);
      const avgRest = currentExercises.reduce((sum, e) => sum + e.restSeconds, 0) / currentExercises.length;
      const estimatedMinutes = Math.ceil((totalSets * (30 + avgRest)) / 60);
      groups.push({ group: currentGroup, exercises: currentExercises, estimatedMinutes, totalSets });
    }

    return groups;
  }, [template]);

  const totalTime = useMemo(() => supersetPlans.reduce((sum, g) => sum + g.estimatedMinutes, 0), [supersetPlans]);
  const totalExercises = template?.exercises.length ?? 0;

  const handleStart = () => {
    router.replace({
      pathname: '/gym/session',
      params: { templateId, templateName },
    });
  };

  const muscleGroupColor = (muscle: string): string => {
    const map: Record<string, string> = {
      back: '#4ECDC4',
      chest: '#FF6B6B',
      quads: '#45B7D1',
      hamstrings: '#96CEB4',
      glutes: '#FFEAA7',
      core: '#DDA0DD',
      full_body: '#FF9F43',
      shoulders: '#74B9FF',
    };
    return map[muscle] || colors.textSecondary;
  };

  if (!template) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="h2" color="primary">{totalExercises}</Text>
            <Text variant="caption" color="textSecondary">Exercises</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h2" color="primary">{supersetPlans.length}</Text>
            <Text variant="caption" color="textSecondary">Supersets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="h2" color="primary">~{totalTime}</Text>
            <Text variant="caption" color="textSecondary">Minutes</Text>
          </View>
        </View>

        {/* Superset Cards */}
        <View style={styles.groupList}>
          {supersetPlans.map((plan, index) => (
            <View key={plan.group} style={styles.groupCard}>
              {/* Group Header */}
              <View style={styles.groupHeader}>
                <View style={styles.groupBadge}>
                  <Text variant="bodyBold" color="textPrimary">
                    {plan.group.startsWith('solo_') ? `#${index + 1}` : `⚡ ${plan.group}`}
                  </Text>
                </View>
                <View style={styles.groupMeta}>
                  <Text variant="caption" color="textSecondary">
                    {plan.totalSets} sets · ~{plan.estimatedMinutes} min
                  </Text>
                </View>
              </View>

              {/* Exercise List */}
              <View style={styles.exerciseList}>
                {plan.exercises.map((te) => (
                  <View key={te.id} style={styles.exerciseRow}>
                    <View style={styles.exerciseInfo}>
                      <Text variant="body" color="textPrimary">{te.exercise.name}</Text>
                      <View style={styles.exerciseDetails}>
                        <Text variant="caption" color="textSecondary">
                          {te.targetSets} × {te.targetRepsMin === te.targetRepsMax
                            ? te.targetRepsMin
                            : `${te.targetRepsMin}-${te.targetRepsMax}`}
                        </Text>
                        <View style={[styles.muscleTag, { backgroundColor: muscleGroupColor(te.exercise.muscleGroup) + '20' }]}>
                          <Text variant="caption" style={{ color: muscleGroupColor(te.exercise.muscleGroup), fontSize: 11 }}>
                            {te.exercise.muscleGroup.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.exerciseEquipment}>
                      <Text variant="caption" color="textTertiary">{te.exercise.equipment}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomBar}>
        <Button title="Start Workout 💪" variant="primary" size="lg" fullWidth onPress={handleStart} />
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
    padding: spacing.lg,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  groupList: {
    gap: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  muscleTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  exerciseEquipment: {
    marginLeft: spacing.sm,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
