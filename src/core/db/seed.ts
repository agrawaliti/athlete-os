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
  // ━━━ Day A — Pull + Posterior Chain + Grip ━━━
  { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', movementPattern: 'hinge', equipment: 'barbell' },
  { name: 'Pull-Up', muscleGroup: 'back', movementPattern: 'vertical_pull', equipment: 'bodyweight' },
  { name: 'Bulgarian Split Squat', muscleGroup: 'glutes', movementPattern: 'lunge', equipment: 'dumbbell' },
  { name: 'Chest Supported Row', muscleGroup: 'back', movementPattern: 'horizontal_pull', equipment: 'dumbbell' },
  { name: 'Kettlebell Swing', muscleGroup: 'glutes', movementPattern: 'hinge', equipment: 'kettlebell' },
  { name: 'Farmer Carry', muscleGroup: 'full_body', movementPattern: 'carry', equipment: 'dumbbell' },
  { name: 'Battle Rope', muscleGroup: 'full_body', movementPattern: 'compound', equipment: 'other' },
  { name: 'Side Plank', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },
  { name: 'Bird Dog', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },
  { name: 'Neck Flexion/Extension', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },

  // ━━━ Day B — Push + Core + Top Pressure ━━━
  { name: 'Front Squat', muscleGroup: 'quads', movementPattern: 'squat', equipment: 'barbell' },
  { name: 'Dumbbell Bench Press', muscleGroup: 'chest', movementPattern: 'horizontal_push', equipment: 'dumbbell' },
  { name: 'Copenhagen Plank', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'bodyweight' },
  { name: 'Sled Push', muscleGroup: 'quads', movementPattern: 'compound', equipment: 'machine' },
  { name: 'Medicine Ball Slam', muscleGroup: 'full_body', movementPattern: 'compound', equipment: 'other' },
  { name: 'Pushups', muscleGroup: 'chest', movementPattern: 'horizontal_push', equipment: 'bodyweight' },
  { name: 'Pallof Press', muscleGroup: 'core', movementPattern: 'isolation', equipment: 'cable' },
];

interface TemplateSpec {
  name: string;
  category: string;
  exercises: { name: string; sets: number; repsMin: number; repsMax: number; rest: number; superset?: string }[];
}

const TEMPLATES: TemplateSpec[] = [
  {
    name: 'Day A — Pull + Posterior Chain + Grip',
    category: 'pull',
    exercises: [
      // Superset A
      { name: 'Romanian Deadlift', sets: 4, repsMin: 6, repsMax: 6, rest: 45, superset: 'A' },
      { name: 'Pull-Up', sets: 4, repsMin: 5, repsMax: 8, rest: 75, superset: 'A' },
      // Superset B
      { name: 'Bulgarian Split Squat', sets: 3, repsMin: 8, repsMax: 8, rest: 30, superset: 'B' },
      { name: 'Chest Supported Row', sets: 3, repsMin: 10, repsMax: 10, rest: 60, superset: 'B' },
      // Conditioning Circuit
      { name: 'Kettlebell Swing', sets: 3, repsMin: 15, repsMax: 15, rest: 0, superset: 'C' },
      { name: 'Farmer Carry', sets: 3, repsMin: 30, repsMax: 30, rest: 0, superset: 'C' },
      { name: 'Battle Rope', sets: 3, repsMin: 20, repsMax: 20, rest: 45, superset: 'C' },
      // Core Finish
      { name: 'Side Plank', sets: 2, repsMin: 30, repsMax: 30, rest: 15, superset: 'D' },
      { name: 'Bird Dog', sets: 2, repsMin: 8, repsMax: 8, rest: 15, superset: 'D' },
      { name: 'Neck Flexion/Extension', sets: 2, repsMin: 15, repsMax: 15, rest: 15, superset: 'D' },
    ],
  },
  {
    name: 'Day B — Push + Core + Top Pressure',
    category: 'push',
    exercises: [
      // Superset A
      { name: 'Front Squat', sets: 4, repsMin: 5, repsMax: 6, rest: 45, superset: 'A' },
      { name: 'Dumbbell Bench Press', sets: 4, repsMin: 6, repsMax: 8, rest: 75, superset: 'A' },
      // Superset B
      { name: 'Chest Supported Row', sets: 3, repsMin: 10, repsMax: 10, rest: 20, superset: 'B' },
      { name: 'Copenhagen Plank', sets: 3, repsMin: 20, repsMax: 20, rest: 45, superset: 'B' },
      // Athletic Circuit
      { name: 'Sled Push', sets: 3, repsMin: 40, repsMax: 40, rest: 0, superset: 'C' },
      { name: 'Medicine Ball Slam', sets: 3, repsMin: 10, repsMax: 10, rest: 0, superset: 'C' },
      { name: 'Pushups', sets: 3, repsMin: 10, repsMax: 15, rest: 45, superset: 'C' },
      // Core Finish
      { name: 'Pallof Press', sets: 3, repsMin: 12, repsMax: 12, rest: 30 },
    ],
  },
];

/**
 * Seeds the database on first launch. Idempotent — checks if exercises exist first.
 * Set FORCE_RESEED to true after changing templates, then back to false.
 */
export function seedDatabase(): void {
  const FORCE_RESEED = true;

  const db = getDatabase();

  if (FORCE_RESEED) {
    db.runSync('PRAGMA foreign_keys = OFF');
    db.runSync('DELETE FROM set_logs');
    db.runSync('DELETE FROM personal_records');
    db.runSync('DELETE FROM workout_sessions');
    db.runSync('DELETE FROM template_exercises');
    db.runSync('DELETE FROM workout_templates');
    db.runSync('DELETE FROM exercises');
    db.runSync('PRAGMA foreign_keys = ON');
  }

  if (exerciseRepo.count() > 0) return; // already seeded

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
