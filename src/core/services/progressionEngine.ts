/**
 * Progression Engine
 *
 * Calculates weight/rep suggestions based on recent history.
 * Philosophy: suggest, don't dictate. Non-linear. Recovery-aware.
 *
 * Rules:
 * 1. All sets hit top of rep range → increase weight
 * 2. 75%+ sets hit target for 2+ sessions → nudge up
 * 3. Performance dropped 20%+ → suggest maintaining (deload hint)
 * 4. No history → use template defaults
 * 5. Default → maintain current weight
 *
 * The engine respects that a combat athlete's recovery is unpredictable.
 * It never forces progression — just nudges when the data supports it.
 */
import { SetLog, TemplateExercise, ProgressionSuggestion, ProgressionReason } from '@/types/global';
import { setLogRepo } from '@/core/repositories';

interface ProgressionInput {
  exerciseId: string;
  templateExercise: TemplateExercise;
}

/**
 * Main entry point: get a progression suggestion for an exercise.
 */
export function calculateProgression(input: ProgressionInput): ProgressionSuggestion {
  const { exerciseId, templateExercise } = input;
  const recentSessions = setLogRepo.getRecentByExercise(exerciseId, 3);

  // No history → first time doing this exercise
  if (recentSessions.length === 0) {
    return {
      exerciseId,
      previousWeight: 0,
      previousReps: 0,
      suggestedWeight: 0,
      suggestedRepsMin: templateExercise.targetRepsMin,
      suggestedRepsMax: templateExercise.targetRepsMax,
      reasoning: 'first_session',
      confidence: 'low',
    };
  }

  const lastSession = recentSessions[0];
  const workingSets = lastSession.filter((s) => !s.isWarmup);

  if (workingSets.length === 0) {
    return buildMaintainSuggestion(exerciseId, 0, 0, templateExercise);
  }

  const lastWeight = mode(workingSets.map((s) => s.weight));
  const lastAvgReps = avg(workingSets.map((s) => s.reps));
  const { targetRepsMax, targetRepsMin } = templateExercise;

  // ━━━ Rule 1: All sets hit top of rep range → increase weight ━━━
  const allSetsHitTarget = workingSets.every((s) => s.reps >= targetRepsMax);
  if (allSetsHitTarget) {
    return {
      exerciseId,
      previousWeight: lastWeight,
      previousReps: Math.round(lastAvgReps),
      suggestedWeight: nextWeight(lastWeight),
      suggestedRepsMin: targetRepsMin,
      suggestedRepsMax: targetRepsMax,
      reasoning: 'reps_exceeded_target',
      confidence: 'high',
    };
  }

  // ━━━ Rule 2: 75%+ sets hit target, consistent for 2+ sessions → nudge ━━━
  const setsHittingTarget = workingSets.filter((s) => s.reps >= targetRepsMax).length;
  const mostSetsHitTarget = setsHittingTarget >= Math.ceil(workingSets.length * 0.75);

  if (mostSetsHitTarget && isConsistentWeight(recentSessions, lastWeight, 2)) {
    return {
      exerciseId,
      previousWeight: lastWeight,
      previousReps: Math.round(lastAvgReps),
      suggestedWeight: nextWeight(lastWeight),
      suggestedRepsMin: targetRepsMin,
      suggestedRepsMax: targetRepsMax,
      reasoning: 'consistent_performance',
      confidence: 'medium',
    };
  }

  // ━━━ Rule 3: Significant performance drop → maintain/deload ━━━
  if (recentSessions.length >= 2) {
    const prevSession = recentSessions[1].filter((s) => !s.isWarmup);
    if (prevSession.length > 0) {
      const prevAvgReps = avg(prevSession.map((s) => s.reps));
      const prevWeight = mode(prevSession.map((s) => s.weight));
      // Reps dropped >20% at same or higher weight
      if (lastAvgReps < prevAvgReps * 0.8 && lastWeight >= prevWeight) {
        return {
          exerciseId,
          previousWeight: lastWeight,
          previousReps: Math.round(lastAvgReps),
          suggestedWeight: lastWeight, // don't increase
          suggestedRepsMin: targetRepsMin,
          suggestedRepsMax: targetRepsMax,
          reasoning: 'deload_suggested',
          confidence: 'medium',
        };
      }
    }
  }

  // ━━━ Default: Maintain ━━━
  return buildMaintainSuggestion(exerciseId, lastWeight, lastAvgReps, templateExercise);
}

// ━━━ Helpers ━━━

function buildMaintainSuggestion(
  exerciseId: string,
  weight: number,
  reps: number,
  templateExercise: TemplateExercise
): ProgressionSuggestion {
  return {
    exerciseId,
    previousWeight: weight,
    previousReps: Math.round(reps),
    suggestedWeight: weight,
    suggestedRepsMin: templateExercise.targetRepsMin,
    suggestedRepsMax: templateExercise.targetRepsMax,
    reasoning: 'maintain',
    confidence: 'high',
  };
}

/**
 * Standard weight increment: 2.5kg.
 * Could be made exercise-aware later (e.g., 1kg for isolation).
 */
function nextWeight(current: number): number {
  return current + 2.5;
}

/**
 * Check if the user has been lifting the same weight for N sessions.
 */
function isConsistentWeight(sessions: SetLog[][], targetWeight: number, minSessions: number): boolean {
  const relevantSessions = sessions.slice(0, minSessions);
  if (relevantSessions.length < minSessions) return false;

  return relevantSessions.every((session) => {
    const working = session.filter((s) => !s.isWarmup);
    if (working.length === 0) return false;
    return mode(working.map((s) => s.weight)) === targetWeight;
  });
}

/** Most common value in an array */
function mode(values: number[]): number {
  if (values.length === 0) return 0;
  const freq = new Map<number, number>();
  for (const v of values) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let maxCount = 0;
  let maxVal = values[0];
  for (const [val, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      maxVal = val;
    }
  }
  return maxVal;
}

/** Average of numeric array */
function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
