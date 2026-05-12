/**
 * Database Schema & Migrations
 *
 * All tables defined here. Migrations are versioned — the app checks
 * the current version on startup and runs any pending migrations.
 *
 * Design decisions:
 * - Timestamps are Unix ms (number) — fast comparisons, no parsing
 * - IDs are nanoid strings — offline-safe, sync-ready
 * - Every record has created_at/updated_at — future sync needs these
 * - Soft deletes (deleted_at) can be added later for sync
 */
import { SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: { version: number; sql: string[] }[] = [
  {
    version: 1,
    sql: [
      // ━━━ Exercises ━━━
      `CREATE TABLE IF NOT EXISTS exercises (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        muscle_group    TEXT NOT NULL,
        movement_pattern TEXT,
        equipment       TEXT NOT NULL,
        notes           TEXT,
        is_custom       INTEGER DEFAULT 0,
        created_at      INTEGER NOT NULL,
        updated_at      INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group)`,

      // ━━━ Workout Templates ━━━
      `CREATE TABLE IF NOT EXISTS workout_templates (
        id                TEXT PRIMARY KEY,
        name              TEXT NOT NULL,
        category          TEXT NOT NULL,
        estimated_duration INTEGER,
        created_at        INTEGER NOT NULL,
        updated_at        INTEGER NOT NULL
      )`,

      // ━━━ Template Exercises ━━━
      `CREATE TABLE IF NOT EXISTS template_exercises (
        id              TEXT PRIMARY KEY,
        template_id     TEXT NOT NULL REFERENCES workout_templates(id),
        exercise_id     TEXT NOT NULL REFERENCES exercises(id),
        sort_order      INTEGER NOT NULL,
        target_sets     INTEGER NOT NULL DEFAULT 3,
        target_reps_min INTEGER NOT NULL DEFAULT 6,
        target_reps_max INTEGER NOT NULL DEFAULT 12,
        rest_seconds    INTEGER NOT NULL DEFAULT 90,
        superset_group  TEXT,
        notes           TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS idx_te_template ON template_exercises(template_id)`,

      // ━━━ Workout Sessions ━━━
      `CREATE TABLE IF NOT EXISTS workout_sessions (
        id              TEXT PRIMARY KEY,
        template_id     TEXT REFERENCES workout_templates(id),
        template_name   TEXT NOT NULL,
        started_at      INTEGER NOT NULL,
        completed_at    INTEGER,
        total_volume    REAL DEFAULT 0,
        total_sets      INTEGER DEFAULT 0,
        duration        INTEGER,
        notes           TEXT,
        rating          INTEGER,
        created_at      INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(started_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_template ON workout_sessions(template_id)`,

      // ━━━ Set Logs ━━━
      `CREATE TABLE IF NOT EXISTS set_logs (
        id              TEXT PRIMARY KEY,
        session_id      TEXT NOT NULL REFERENCES workout_sessions(id),
        exercise_id     TEXT NOT NULL REFERENCES exercises(id),
        set_number      INTEGER NOT NULL,
        weight          REAL NOT NULL,
        reps            INTEGER NOT NULL,
        rpe             REAL,
        is_warmup       INTEGER DEFAULT 0,
        is_pr           INTEGER DEFAULT 0,
        completed_at    INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_sl_session ON set_logs(session_id)`,
      `CREATE INDEX IF NOT EXISTS idx_sl_exercise ON set_logs(exercise_id, completed_at DESC)`,

      // ━━━ Personal Records ━━━
      `CREATE TABLE IF NOT EXISTS personal_records (
        id              TEXT PRIMARY KEY,
        exercise_id     TEXT NOT NULL REFERENCES exercises(id),
        pr_type         TEXT NOT NULL,
        value           REAL NOT NULL,
        weight          REAL,
        reps            INTEGER,
        session_id      TEXT REFERENCES workout_sessions(id),
        achieved_at     INTEGER NOT NULL,
        previous_value  REAL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_prs_exercise ON personal_records(exercise_id, pr_type)`,
      `CREATE INDEX IF NOT EXISTS idx_prs_date ON personal_records(achieved_at DESC)`,

      // ━━━ Activity Sessions (future-ready) ━━━
      `CREATE TABLE IF NOT EXISTS activity_sessions (
        id              TEXT PRIMARY KEY,
        activity_type   TEXT NOT NULL,
        started_at      INTEGER NOT NULL,
        completed_at    INTEGER,
        duration        INTEGER,
        notes           TEXT,
        rating          INTEGER,
        metadata        TEXT,
        created_at      INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_sessions(activity_type, started_at DESC)`,
    ],
  },
];

/**
 * Run all pending migrations. Called once on app startup.
 */
export function runMigrations(db: SQLiteDatabase): void {
  db.execSync(
    `CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    )`
  );

  const applied = db
    .getAllSync<{ version: number }>('SELECT version FROM _migrations')
    .map((r) => r.version);

  for (const migration of MIGRATIONS) {
    if (!applied.includes(migration.version)) {
      for (const sql of migration.sql) {
        db.execSync(sql);
      }
      db.runSync(
        'INSERT INTO _migrations (version, applied_at) VALUES (?, ?)',
        migration.version,
        Date.now()
      );
      console.log(`[DB] Migration v${migration.version} applied`);
    }
  }
}
