// Stub — full implementation in Phase 1 Step 4
// Depends on: expo-sqlite (to be installed)

/**
 * SQLite singleton connection.
 * Schema:
 *   CREATE TABLE IF NOT EXISTS reminders (
 *     id             TEXT PRIMARY KEY,
 *     label          TEXT NOT NULL,
 *     datetime       INTEGER NOT NULL,
 *     language       TEXT NOT NULL,
 *     originalText   TEXT NOT NULL,
 *     isCompleted    INTEGER DEFAULT 0,
 *     createdAt      INTEGER NOT NULL,
 *     notificationId TEXT
 *   );
 */

// TODO: implement in Phase 1 Step 4 with expo-sqlite
export {};
