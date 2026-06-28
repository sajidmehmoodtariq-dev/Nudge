// Reminder type — mirrors SQLite schema exactly
export interface Reminder {
  id: string; // UUID
  label: string; // what the reminder is about
  datetime: number; // unix ms timestamp
  language: 'ENGLISH' | 'ROMAN_URDU' | 'URDU_SCRIPT';
  originalText: string; // raw input from user
  isCompleted: 0 | 1; // 0 = pending, 1 = done
  createdAt: number; // unix ms
  notificationId?: string; // from @notifee/react-native
}
