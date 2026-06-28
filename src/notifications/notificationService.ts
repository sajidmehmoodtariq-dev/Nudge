// Stub — full implementation in Phase 1 Step 11
// Depends on: @notifee/react-native (to be installed)

/**
 * Schedules a local notification via @notifee/react-native.
 * Returns the notification ID to store in SQLite.
 */
export async function scheduleNotification(_label: string, _datetimeMs: number): Promise<string> {
  // TODO: implement in Phase 1 Step 11
  throw new Error('Not implemented');
}

export async function cancelNotification(_notificationId: string): Promise<void> {
  // TODO: implement in Phase 1 Step 11
  throw new Error('Not implemented');
}
