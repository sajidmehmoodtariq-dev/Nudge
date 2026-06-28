// Stub — full implementation in Phase 1 Step 12
// Depends on: zustand (to be installed: npm install zustand)
// import {create} from 'zustand';

import type {Reminder} from '@reminders/types';

export interface ReminderStore {
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Reminder) => void;
  markDone: (id: string) => void;
  removeReminder: (id: string) => void;
}

/**
 * TODO Phase 1 Step 12:
 *   1. npm install zustand
 *   2. Replace this stub with:
 *      export const useReminderStore = create<ReminderStore>(set => ({ ... }))
 */
export const useReminderStore = (): ReminderStore => {
  throw new Error('useReminderStore: zustand not installed yet. See Phase 1 Step 12.');
};
