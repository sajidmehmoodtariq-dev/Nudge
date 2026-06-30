import * as SQLite from 'expo-sqlite';

// Open or create the database. The connection is a singleton.
const db = SQLite.openDatabaseSync('nudge.db');

/**
 * Initializes the database tables. Should be called on app launch.
 * It uses IF NOT EXISTS so it's idempotent.
 */
export function initDB() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      label TEXT,
      datetime INTEGER,
      language TEXT,
      originalText TEXT,
      isCompleted INTEGER DEFAULT 0,
      createdAt INTEGER
    );
  `);
}

export default db;
