// Stub — full implementation in Phase 1 Step 4
import type {Reminder} from './types';

// TODO: implement in Phase 1 Step 4
export async function createReminder(
  _reminder: Omit<Reminder, 'id' | 'createdAt'>,
): Promise<Reminder> {
  throw new Error('Not implemented');
}

export async function getAll(): Promise<Reminder[]> {
  throw new Error('Not implemented');
}

export async function getCompleted(): Promise<Reminder[]> {
  throw new Error('Not implemented');
}

export async function markDone(_id: string): Promise<void> {
  throw new Error('Not implemented');
}

export async function deleteReminder(_id: string): Promise<void> {
  throw new Error('Not implemented');
}
