/**
 * Seed Data
 *
 * Pre-populates exercises and workout templates on first launch.
 * Exercises chosen for a typical PPL (Push/Pull/Legs) program —
 * the most common split for strength-focused hybrid athletes.
 */
import { getDatabase } from './client';
import { nanoid } from 'nanoid/non-secure';
import { exerciseRepo } from '../repositories/exerciseRepo';

interface SeedExercise {
  name: string;
  muscleGroup: string;
  movementPattern: string;
  equipment: string;
}

const EXERCISES: SeedExercise[] = [
  // ━━━ Push ━━━
  { name: 'Bench Press', muscleGroup: 'chest', movementPattern: 'horizontal_push', equipment: 'barbell' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', movementPattern: 'horizontal_push', equipment: 'dumbbell' },
  { name: 'Overhead Press', muscleGroup: 'shoulders', movementPattern: 'vertical_push', equipment: 'barbell' },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', movementPattern: 'isolation', equipment: 'dumbbell' },
  { name: 'Tricep Pushdown', muscleGroup: 'triceps', movementPattern: 'isolation', equipment: 'cable' },
  { name: 'Overhead Tricep Extension', muscleGroup: 'triceps', movementPattern: 'isolation', equipment: 'cable' },
  { name: 'Cable Fly', muscleGroup: 'chest', movementPattern: 'isolation', equipment: 'cable' },
  { name: 'Dips', muscleGroup: 'chest', movementPattern: 'compound', equipment: 'bodyweight' },

  // ━━━ Pull ━━━
  { name: 'Barbell Row', muscleGroup: 'back', movementPattern: 'horizontal_pull', equipment: 'barbell' },
  { name: 'Pull-Up', muscleGroup: 'back', movementPattern: 'vertical_pull', equipment: 'bodyweight' },
  { name: 'Lat Pulldown', muscleGroup: 'back', movementPattern: 'vertical_pull', equipment: 'cable' },
  { name: 'Seated Cable Row', muscleGroup: 'back', movementPattern: 'horizontal_pull', equipment: 'cable' },
  { name: 'Face Pull', muscleGroup: 'shoulders', movementPattern: 'horizontal_pull', equipment: 'cable' },
  { name: 'Barbell Curl', muscleGroup: 'biceps', movementPattern: 'isolation', equipment: 'barbell' },
  { name: 'Hammer Curl', muscleGroup: 'biceps', movementPattern: 'isolation', equipment: 'dumbbell' },
  { name: 'Dumbbell Row', muscleGroup: 'back', movementPattern: 'horizontal_pull', equipment: 'dumbbell' },

  // ━━━ Legs ━━━
  { name: 'Barbell Squat', muscleGroup: 'quads', movementPattern: 'squat', equipment: 'barbell' },
  { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', movementPattern: 'hinge', equipment: 'barbell' },
  { name: 'Leg Press', muscleGroup: 'quads', movementPattern: 'squat', equipment: 'machine' },
  { name: 'Leg Curl', muscleGroup: 'hamstrings', movementPattern: 'isolation', equipment: 'machine' },
  { name: 'Leg Extension', muscleGroup: 'quads', movementPattern: 'isolation', equipment: 'machine' },
  { name: 'Calf Raise', muscleGroup: 'calves', movementPattern: 'isolation', equipment: 'machine' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'quads', movementPattern: 'lunge', equipment: 'dumbbell' },
  { name: 'Hip Thrust', muscleGroup: 'glutes', movementPattern: 'hinge', equipment: 'barbell' },

  // ━━━ Compound / Full Body ━━━
  { name: 'Deadlift', muscleGroup: 'back', movementPattern: 'hinge', equipment: 'barbell' },
  { name: 'Farmers Walk', muscleGroup: 'full_body', movementPattern: 'carry', equipment: 'dumbbell' },

  // ━━━ Core ━━━
  { name: 'Hanging Leg Raise', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },
  { name: 'Cable Crunch', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'cable' },
  { name: 'Plank', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },
];

interface TemplateSpec {
  name: string;
  category: string;
  exercises: { name: string; sets: number; repsMin: number; repsMax: number; rest: number; superset?: string }[];
}

const TEMPLATES: TemplateSpec[] = [
  {
    name: 'Pull Day',
    category: 'pull',
    exercises: [
      { name: 'Barbell Row', sets: 4, repsMin: 6, repsMax: 8, rest: 120 },
      { name: 'Lat Pulldown', sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
      { name: 'Seated Cable Row', sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
      { name: 'Face Pull', sets: 3, repsMin: 12, repsMax: 15, rest: 60, superset: 'A' },
      { name: 'Hammer Curl', sets: 3, repsMin: 10, repsMax: 12, rest: 60, superset: 'A' },
      { name: 'Barbell Curl', sets: 3, repsMin: 8, repsMax: 12, rest: 60 },
    ],
  },
  {
    name: 'Push Day',
    category: 'push',
    exercises: [
      { name: 'Bench Press', sets: 4, repsMin: 6, repsMax: 8, rest: 120 },
      { name: 'Incline Dumbbell Press', sets: 3, repsMin: 8, repsMax: 12, rest: 90 },
      { name: 'Overhead Press', sets: 3, repsMin: 6, repsMax: 10, rest: 90 },
      { name: 'Cable Fly', sets: 3, repsMin: 12, repsMax: 15, rest: 60, superset: 'A' },
      { name: 'Dumbbell Lateral Raise', sets: 3, repsMin: 12, repsMax: 15, rest: 60, superset: 'A' },
      { name: 'Tricep Pushdown', sets: 3, repsMin: 10, repsMax: 12, rest: 60, superset: 'B' },
      { name: 'Overhead Tricep Extension', sets: 3, repsMin: 10, repsMax: 12, rest: 60, superset: 'B' },
    ],
  },
  {
    name: 'Legs',
    category: 'legs',
    exercises: [
      { name: 'Barbell Squat', sets: 4, repsMin: 6, repsMax: 8, rest: 150 },
      { name: 'Romanian Deadlift', sets: 3, repsMin: 8, repsMax: 10, rest: 120 },
      { name: 'Leg Press', sets: 3, repsMin: 10, repsMax: 12, rest: 90 },
      { name: 'Leg Curl', sets: 3, repsMin: 10, repsMax: 12, rest: 60, superset: 'A' },
      { name: 'Leg Extension', sets: 3, repsMin: 10, repsMax: 12, rest: 60, superset: 'A' },
      { name: 'Calf Raise', sets: 4, repsMin: 12, repsMax: 15, rest: 60 },
    ],
  },
];

/**
 * Seeds the database on first launch. Idempotent — checks if exercises exist first.
 */
export function seedDatabase(): void {
  if (exerciseRepo.count() > 0) return; // already seeded

  const db = getDatabase();
  const now = Date.now();

  // Build exercise name → ID map for template references
  const exerciseIdMap = new Map<string, string>();

  for (const ex of EXERCISES) {
    const id = nanoid();
    exerciseIdMap.set(ex.name, id);
    db.runSync(
      `INSERT INTO exercises (id, name, muscle_group, movement_pattern, equipment, is_custom, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
      id, ex.name, ex.muscleGroup, ex.movementPattern, ex.equipment, now, now
    );
  }

  for (const tmpl of TEMPLATES) {
    const templateId = nanoid();
    db.runSync(
      `INSERT INTO workout_templates (id, name, category, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      templateId, tmpl.name, tmpl.category, now, now
    );

    tmpl.exercises.forEach((ex, index) => {
      const exerciseId = exerciseIdMap.get(ex.name);
      if (!exerciseId) return;

      db.runSync(
        `INSERT INTO template_exercises (id, template_id, exercise_id, sort_order, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        nanoid(), templateId, exerciseId, index, ex.sets, ex.repsMin, ex.repsMax, ex.rest, ex.superset ?? null
      );
    });
  }

  console.log(`[Seed] Inserted ${EXERCISES.length} exercises and ${TEMPLATES.length} templates`);
}
