/**
 * Set Log Repository
 *
 * Handles individual set records. The most frequently written table —
 * every tap of "Log Set" writes here.
 */
import { getDatabase } from '../db/client';
import { SetLog } from '../../types/global';

function rowToSetLog(row: any): SetLog {
  return {
    id: row.id,
    sessionId: row.session_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    reps: row.reps,
    rpe: row.rpe,
    isWarmup: !!row.is_warmup,
    isPR: !!row.is_pr,
    completedAt: row.completed_at,
  };
}

export const setLogRepo = {
  getBySession(sessionId: string): SetLog[] {
    const db = getDatabase();
    return db
      .getAllSync(
        'SELECT * FROM set_logs WHERE session_id = ? ORDER BY completed_at',
        sessionId
      )
      .map(rowToSetLog);
  },

  /**
   * Get recent sets for an exercise, grouped by session.
   * Used by the progression engine to compare against previous workouts.
   */
  getRecentByExercise(exerciseId: string, sessionCount: number = 3): SetLog[][] {
    const db = getDatabase();

    // Get the last N distinct session IDs for this exercise
    const sessionIds = db
      .getAllSync<{ session_id: string }>(
        `SELECT DISTINCT session_id FROM set_logs
         WHERE exercise_id = ?
         ORDER BY completed_at DESC
         LIMIT ?`,
        exerciseId,
        sessionCount
      )
      .map((r) => r.session_id);

    // Get all sets for those sessions, grouped
    return sessionIds.map((sid) =>
      db
        .getAllSync(
          'SELECT * FROM set_logs WHERE session_id = ? AND exercise_id = ? ORDER BY set_number',
          sid,
          exerciseId
        )
        .map(rowToSetLog)
    );
  },

  insert(setLog: SetLog): void {
    const db = getDatabase();
    db.runSync(
      `INSERT INTO set_logs (id, session_id, exercise_id, set_number, weight, reps, rpe, is_warmup, is_pr, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      setLog.id,
      setLog.sessionId,
      setLog.exerciseId,
      setLog.setNumber,
      setLog.weight,
      setLog.reps,
      setLog.rpe,
      setLog.isWarmup ? 1 : 0,
      setLog.isPR ? 1 : 0,
      setLog.completedAt
    );
  },

  delete(id: string): void {
    const db = getDatabase();
    db.runSync('DELETE FROM set_logs WHERE id = ?', id);
  },
};
