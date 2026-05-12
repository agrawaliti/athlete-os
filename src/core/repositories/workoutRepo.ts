/**
 * Workout Repository
 *
 * Handles workout templates, sessions, and the join between them.
 */
import { getDatabase } from '../db/client';
import {
  WorkoutTemplate,
  WorkoutSession,
  TemplateExercise,
  TemplateExerciseWithDetails,
  WorkoutTemplateWithExercises,
} from '../../types/global';
import { exerciseRepo } from './exerciseRepo';

function rowToTemplate(row: any): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    estimatedDuration: row.estimated_duration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTemplateExercise(row: any): TemplateExercise {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    sortOrder: row.sort_order,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds,
    supersetGroup: row.superset_group,
    notes: row.notes,
  };
}

function rowToSession(row: any): WorkoutSession {
  return {
    id: row.id,
    templateId: row.template_id,
    templateName: row.template_name,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    totalVolume: row.total_volume,
    totalSets: row.total_sets,
    duration: row.duration,
    notes: row.notes,
    rating: row.rating,
    createdAt: row.created_at,
  };
}

export const workoutRepo = {
  // ━━━ Templates ━━━

  getAllTemplates(): WorkoutTemplate[] {
    const db = getDatabase();
    return db.getAllSync('SELECT * FROM workout_templates ORDER BY name').map(rowToTemplate);
  },

  getTemplateWithExercises(templateId: string): WorkoutTemplateWithExercises | null {
    const db = getDatabase();
    const templateRow = db.getFirstSync(
      'SELECT * FROM workout_templates WHERE id = ?',
      templateId
    );
    if (!templateRow) return null;

    const template = rowToTemplate(templateRow);
    const teRows = db.getAllSync(
      'SELECT * FROM template_exercises WHERE template_id = ? ORDER BY sort_order',
      templateId
    );

    const exercises: TemplateExerciseWithDetails[] = teRows
      .map(rowToTemplateExercise)
      .map((te) => {
        const exercise = exerciseRepo.getById(te.exerciseId);
        if (!exercise) return null;
        return { ...te, exercise };
      })
      .filter(Boolean) as TemplateExerciseWithDetails[];

    return { ...template, exercises };
  },

  createTemplate(template: WorkoutTemplate): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO workout_templates (id, name, category, estimated_duration, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      template.id,
      template.name,
      template.category,
      template.estimatedDuration,
      template.createdAt,
      template.updatedAt
    );
  },

  createTemplateExercise(te: TemplateExercise): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO template_exercises (id, template_id, exercise_id, sort_order, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      te.id,
      te.templateId,
      te.exerciseId,
      te.sortOrder,
      te.targetSets,
      te.targetRepsMin,
      te.targetRepsMax,
      te.restSeconds,
      te.supersetGroup,
      te.notes
    );
  },

  // ━━━ Sessions ━━━

  getRecentSessions(limit: number = 10): WorkoutSession[] {
    const db = getDatabase();
    return db
      .getAllSync('SELECT * FROM workout_sessions ORDER BY started_at DESC LIMIT ?', limit)
      .map(rowToSession);
  },

  createSession(session: WorkoutSession): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO workout_sessions (id, template_id, template_name, started_at, completed_at, total_volume, total_sets, duration, notes, rating, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id,
      session.templateId,
      session.templateName,
      session.startedAt,
      session.completedAt,
      session.totalVolume,
      session.totalSets,
      session.duration,
      session.notes,
      session.rating,
      session.createdAt
    );
  },

  updateSession(id: string, updates: Partial<WorkoutSession>): void {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.completedAt !== undefined) { fields.push('completed_at = ?'); values.push(updates.completedAt); }
    if (updates.totalVolume !== undefined) { fields.push('total_volume = ?'); values.push(updates.totalVolume); }
    if (updates.totalSets !== undefined) { fields.push('total_sets = ?'); values.push(updates.totalSets); }
    if (updates.duration !== undefined) { fields.push('duration = ?'); values.push(updates.duration); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    if (updates.rating !== undefined) { fields.push('rating = ?'); values.push(updates.rating); }

    if (fields.length === 0) return;
    values.push(id);
    db.runSync(`UPDATE workout_sessions SET ${fields.join(', ')} WHERE id = ?`, ...values);
  },
};
