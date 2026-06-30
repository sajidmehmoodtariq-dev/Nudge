/* eslint-disable no-console */
import getDB from './db';
import type {Reminder} from './types';
import {cancelNotification} from '../notifications/notificationService';

// Fallback UUID generator since expo-crypto and react-native-get-random-values caused build issues
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export async function createReminder(
  reminder: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted' | 'notificationId'>,
): Promise<string> {
  try {
    const id = generateId();
    const createdAt = Date.now();
    const db = await getDB();
    await db.executeSql(
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
    const db = await getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM reminders WHERE isCompleted = 0 ORDER BY datetime ASC',
    );
    const rows: Reminder[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }
    return rows;
  } catch (error) {
    console.error('Failed to get all reminders:', error);
    throw error;
  }
}

export async function getCompleted(): Promise<Reminder[]> {
  try {
    const db = await getDB();
    const [results] = await db.executeSql(
      'SELECT * FROM reminders WHERE isCompleted = 1 ORDER BY createdAt DESC',
    );
    const rows: Reminder[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      rows.push(results.rows.item(i));
    }
    return rows;
  } catch (error) {
    console.error('Failed to get completed reminders:', error);
    throw error;
  }
}

export async function markDone(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.executeSql('UPDATE reminders SET isCompleted = 1 WHERE id = ?', [id]);
    await cancelNotification(id);
  } catch (error) {
    console.error('Failed to mark reminder as done:', error);
    throw error;
  }
}

export async function deleteReminder(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.executeSql('DELETE FROM reminders WHERE id = ?', [id]);
    await cancelNotification(id);
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    throw error;
  }
}
