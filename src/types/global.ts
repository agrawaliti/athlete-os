/**
 * Core domain types for AthleteOS.
 *
 * These types map 1:1 to database rows but use camelCase
 * (repositories handle the snake_case ↔ camelCase conversion).
 */

// ━━━ Enums ━━━

export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'core'
  | 'forearms' | 'full_body';

export type MovementPattern =
  | 'horizontal_push' | 'horizontal_pull'
  | 'vertical_push' | 'vertical_pull'
  | 'squat' | 'hinge' | 'lunge'
  | 'carry' | 'isolation' | 'compound';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'kettlebell' | 'band' | 'other';

export type WorkoutCategory =
  | 'push' | 'pull' | 'legs' | 'upper' | 'lower'
  | 'full_body' | 'custom';

export type PRType = 'weight' | 'reps' | 'volume' | 'estimated_1rm';

export type ProgressionReason =
  | 'reps_exceeded_target'
  | 'consistent_performance'
  | 'maintain'
  | 'deload_suggested'
  | 'first_session'
  | 'returning_after_break';

export type ActivityType = 'gym' | 'bjj' | 'swimming' | 'running' | 'other';

// ━━━ Entities ━━━

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  movementPattern: MovementPattern | null;
  equipment: Equipment;
  notes: string | null;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  category: WorkoutCategory;
  estimatedDuration: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  sortOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds: number;
  supersetGroup: string | null;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  templateId: string | null;
  templateName: string;
  startedAt: number;
  completedAt: number | null;
  totalVolume: number;
  totalSets: number;
  duration: number | null;
  notes: string | null;
  rating: number | null;
  createdAt: number;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number | null;
  isWarmup: boolean;
  isPR: boolean;
  completedAt: number;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  prType: PRType;
  value: number;
  weight: number | null;
  reps: number | null;
  sessionId: string | null;
  achievedAt: number;
  previousValue: number | null;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  previousWeight: number;
  previousReps: number;
  suggestedWeight: number;
  suggestedRepsMin: number;
  suggestedRepsMax: number;
  reasoning: ProgressionReason;
  confidence: 'high' | 'medium' | 'low';
}

// ━━━ Composed types (used by UI) ━━━

export interface TemplateExerciseWithDetails extends TemplateExercise {
  exercise: Exercise;
}

export interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises: TemplateExerciseWithDetails[];
}
