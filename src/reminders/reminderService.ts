/* eslint-disable no-console */
import * as Crypto from 'expo-crypto';

import db from './db';
import type {Reminder} from './types';
import {cancelReminderNotification} from '../services/Notifications';

export async function createReminder(
  reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted' | 'notificationId'>,
): Promise<string> {
  try {
    const id = Crypto.randomUUID();
    const createdAt = Date.now();
    await db.runAsync(
      `INSERT INTO reminders (id, label, datetime, language, originalText, isCompleted, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [id, reminder.label, reminder.datetime, reminder.language, reminder.originalText, createdAt],
    );
    return id;
  } catch (error) {
    console.error('Failed to create reminder:', error);
    throw error;
  }
}

export async function getAll(): Promise<Reminder[]> {
  try {
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE isCompleted = 0 ORDER BY datetime ASC',
    );
  } catch (error) {
    console.error('Failed to get all reminders:', error);
    throw error;
  }
}

export async function getCompleted(): Promise<Reminder[]> {
  try {
    return await db.getAllAsync<Reminder>(
      'SELECT * FROM reminders WHERE isCompleted = 1 ORDER BY createdAt DESC',
    );
  } catch (error) {
    console.error('Failed to get completed reminders:', error);
    throw error;
  }
}

export async function markDone(id: string): Promise<void> {
  try {
    await db.runAsync('UPDATE reminders SET isCompleted = 1 WHERE id = ?', [id]);
    await cancelReminderNotification(id);
  } catch (error) {
    console.error('Failed to mark reminder as done:', error);
    throw error;
  }
}

export async function deleteReminder(id: string): Promise<void> {
  try {
    await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
    await cancelReminderNotification(id);
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    throw error;
  }
}
