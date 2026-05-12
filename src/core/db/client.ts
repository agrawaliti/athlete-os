/**
 * Database client — singleton SQLite connection.
 *
 * Why expo-sqlite: ships with Expo, synchronous reads (no loading spinners
 * for cached data), SQL is ideal for relational workout data.
 */
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('athlete-os.db');
    db.execSync('PRAGMA journal_mode = WAL;');
    db.execSync('PRAGMA foreign_keys = ON;');
  }
  return db;
}
