/**
 * Exercise Repository
 *
 * Data access for exercises. Handles snake_case ↔ camelCase mapping.
 * All other code in the app uses camelCase types — only repos touch SQL.
 */
import { getDatabase } from '../db/client';
import { Exercise, MuscleGroup, MovementPattern, Equipment } from '../../types/global';

function rowToExercise(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group,
    movementPattern: row.movement_pattern,
    equipment: row.equipment,
    notes: row.notes,
    isCustom: !!row.is_custom,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const exerciseRepo = {
  getAll(): Exercise[] {
    const db = getDatabase();
    return db.getAllSync('SELECT * FROM exercises ORDER BY name').map(rowToExercise);
  },

  getById(id: string): Exercise | null {
    const db = getDatabase();
    const row = db.getFirstSync('SELECT * FROM exercises WHERE id = ?', id);
    return row ? rowToExercise(row) : null;
  },

  search(query: string): Exercise[] {
    const db = getDatabase();
    return db
      .getAllSync('SELECT * FROM exercises WHERE name LIKE ? ORDER BY name', `%${query}%`)
      .map(rowToExercise);
  },

  create(exercise: Omit<Exercise, 'createdAt' | 'updatedAt'>): Exercise {
    const db = getDatabase();
    const now = Date.now();
    db.runSync(
      `INSERT INTO exercises (id, name, muscle_group, movement_pattern, equipment, notes, is_custom, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      exercise.id,
      exercise.name,
      exercise.muscleGroup,
      exercise.movementPattern,
      exercise.equipment,
      exercise.notes,
      exercise.isCustom ? 1 : 0,
      now,
      now
    );
    return { ...exercise, createdAt: now, updatedAt: now };
  },

  count(): number {
    const db = getDatabase();
    const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');
    return row?.count ?? 0;
  },
};
