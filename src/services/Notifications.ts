import type {TimestampTrigger} from '@notifee/react-native';
import notifee, {TriggerType} from '@notifee/react-native';

export async function requestNotificationPermission() {
  await notifee.requestPermission();
}

export async function scheduleReminderNotification(
  label: string,
  datetime: Date,
  reminderId: number,
) {
  // Request permissions (required for iOS)
  await requestNotificationPermission();

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'reminders',
    name: 'Task Reminders',
    sound: 'default',
  });

  // Create a time-based trigger
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: datetime.getTime(), // fire at the exact datetime
  };

  // Create the trigger notification
  await notifee.createTriggerNotification(
    {
      id: reminderId.toString(),
      title: 'Nudge Reminder',
      body: label,
      android: {
        channelId,
        smallIcon: 'ic_launcher', // default app icon
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger,
  );
}
