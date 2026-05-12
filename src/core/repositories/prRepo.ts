/**
 * PR Repository
 *
 * Tracks personal records per exercise. PRs are detected on set logging
 * and stored separately for fast analytics queries.
 */
import { getDatabase } from '../db/client';
import { PersonalRecord, SetLog } from '../../types/global';
import { nanoid } from 'nanoid/non-secure';

function rowToPR(row: any): PersonalRecord {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    prType: row.pr_type,
    value: row.value,
    weight: row.weight,
    reps: row.reps,
    sessionId: row.session_id,
    achievedAt: row.achieved_at,
    previousValue: row.previous_value,
  };
}

export const prRepo = {
  getByExercise(exerciseId: string): PersonalRecord[] {
    const db = getDatabase();
    return db
      .getAllSync(
        'SELECT * FROM personal_records WHERE exercise_id = ? ORDER BY achieved_at DESC',
        exerciseId
      )
      .map(rowToPR);
  },

  getRecent(limit: number = 10): PersonalRecord[] {
    const db = getDatabase();
    return db
      .getAllSync(
        'SELECT * FROM personal_records ORDER BY achieved_at DESC LIMIT ?',
        limit
      )
      .map(rowToPR);
  },

  /**
   * Check if a set is a PR and record it.
   * Returns the PR record if it's a new one, null otherwise.
   */
  checkAndRecord(setLog: SetLog): PersonalRecord | null {
    if (setLog.isWarmup) return null;

    const db = getDatabase();

    // Check weight PR (heaviest weight at any rep count)
    const currentWeightPR = db.getFirstSync<{ value: number }>(
      `SELECT value FROM personal_records
       WHERE exercise_id = ? AND pr_type = 'weight'
       ORDER BY value DESC LIMIT 1`,
      setLog.exerciseId
    );

    if (!currentWeightPR || setLog.weight > currentWeightPR.value) {
      const pr: PersonalRecord = {
        id: nanoid(),
        exerciseId: setLog.exerciseId,
        prType: 'weight',
        value: setLog.weight,
        weight: setLog.weight,
        reps: setLog.reps,
        sessionId: setLog.sessionId,
        achievedAt: setLog.completedAt,
        previousValue: currentWeightPR?.value ?? null,
      };
      this.insert(pr);
      return pr;
    }

    return null;
  },

  insert(pr: PersonalRecord): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO personal_records (id, exercise_id, pr_type, value, weight, reps, session_id, achieved_at, previous_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      pr.id,
      pr.exerciseId,
      pr.prType,
      pr.value,
      pr.weight,
      pr.reps,
      pr.sessionId,
      pr.achievedAt,
      pr.previousValue
    );
  },
};
