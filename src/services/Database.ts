import SQLite from 'react-native-sqlite-storage';

import type {Language} from '../parser/types';

// Use promises for SQLite API
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabase({
    name: 'nudge_reminders.db',
    location: 'default',
  });

  // Initialize schema
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      datetime TEXT NOT NULL,
      language TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function insertReminder(
  label: string,
  datetime: Date,
  language: Language,
): Promise<number> {
  const database = await getDB();
  const [result] = await database.executeSql(
    'INSERT INTO reminders (label, datetime, language) VALUES (?, ?, ?)',
    [label, datetime.toISOString(), language],
  );

  return result.insertId;
}
