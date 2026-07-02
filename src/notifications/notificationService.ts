import type {TimestampTrigger} from '@notifee/react-native';
import notifee, {
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as reminderService from '../reminders/reminderService';

export const PERMISSION_STATUS_KEY = '@nudge_notification_permission';

export async function requestNotificationPermission() {
  const existingStatus = await AsyncStorage.getItem(PERMISSION_STATUS_KEY);
  if (existingStatus === 'granted') {
    return true;
  }

  const settings = await notifee.requestPermission();
  const granted = settings.authorizationStatus >= 1; // 1 or greater means authorized

  await AsyncStorage.setItem(PERMISSION_STATUS_KEY, granted ? 'granted' : 'denied');
  return granted;
}

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'nudge-reminders',
    name: 'Nudge Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

export async function scheduleNotification({
  id,
  title,
  datetime,
}: {
  id: string;
  title: string;
  datetime: Date;
}): Promise<string> {
  await requestNotificationPermission();
  await createNotificationChannel();

  const androidSettings = await notifee.getNotificationSettings();
  // 1 is ENABLED, -1 is NOT_SUPPORTED (i.e. Android < 12)
  if (androidSettings.alarm === 0 || androidSettings.alarm === false) {
    try {
      await notifee.openAlarmPermissionSettings();
    } catch (e) {
      console.warn('Failed to open alarm settings', e);
    }
  }

  const formattedTime = datetime.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Custom "Today/Tomorrow" prefix logic
  const now = new Date();
  const isToday =
    datetime.getDate() === now.getDate() &&
    datetime.getMonth() === now.getMonth() &&
    datetime.getFullYear() === now.getFullYear();

  const bodyText = isToday
    ? `Today at ${formattedTime.split(',')[1] || formattedTime}`
    : formattedTime;

  let triggerTime = datetime.getTime();
  if (triggerTime <= Date.now()) {
    triggerTime = Date.now() + 2000; // Ensure it's slightly in the future
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTime,
  };

  const notificationId = id; // use the reminder ID as the notification ID for simplicity

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title,
      body: bodyText,
      data: {
        reminderId: id,
        isAlarm: 'true',
      },
      android: {
        channelId: 'nudge-reminders',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        fullScreenAction: {
          id: 'default',
        },
        category: AndroidCategory.ALARM,
        visibility: AndroidVisibility.PUBLIC,
      },
    },
    trigger,
  );

  return notificationId;
}

export async function cancelNotification(notificationId: string) {
  try {
    await notifee.cancelTriggerNotification(notificationId);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
}

export async function checkPastDueReminders() {
  try {
    const reminders = await reminderService.getAll();
    const now = Date.now();
    const pastDue = reminders.filter(r => r.datetime < now);

    if (pastDue.length > 0) {
      await createNotificationChannel();
      await notifee.displayNotification({
        title: 'Missed Reminders',
        body: `You have ${pastDue.length} past-due reminders.`,
        android: {
          channelId: 'nudge-reminders',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });
    }
  } catch (error) {
    console.error('Error checking past due reminders:', error);
  }
}
