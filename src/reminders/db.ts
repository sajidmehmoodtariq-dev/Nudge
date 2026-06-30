import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabase({name: 'nudge.db', location: 'default'});
  return db;
}

export async function initDB() {
  const database = await getDB();
  await database.executeSql(`
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

export default getDB;
