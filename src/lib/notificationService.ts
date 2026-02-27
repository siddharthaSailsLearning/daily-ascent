import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNativePlatform()) {
    console.log('Notifications only work on native platforms');
    return false;
  }
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return false;
  }
};

export const scheduleHabitReminder = async (
  habitId: string,
  habitName: string,
  habitIcon: string,
  reminderTime: string, // "HH:mm"
  customSoundPath?: string
) => {
  if (!isNativePlatform()) {
    console.log(`[Web] Would schedule "${habitName}" at ${reminderTime}`);
    return;
  }

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const [hours, minutes] = reminderTime.split(':').map(Number);
  const notifId = hashStringToInt(habitId);

  // Cancel existing notification for this habit first
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {
    // ignore if not found
  }

  const scheduleOptions: ScheduleOptions = {
    notifications: [
      {
        id: notifId,
        title: `${habitIcon} ${habitName}`,
        body: `Time for your habit: ${habitName}! Stay consistent 💪`,
        schedule: {
          on: { hour: hours, minute: minutes },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: customSoundPath || undefined,
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
        channelId: 'habit-reminders',
      },
    ],
  };

  try {
    await LocalNotifications.schedule(scheduleOptions);
    console.log(`Scheduled reminder for "${habitName}" at ${reminderTime}`);
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
};

export const cancelHabitReminder = async (habitId: string) => {
  if (!isNativePlatform()) return;
  const notifId = hashStringToInt(habitId);
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {
    // ignore
  }
};

export const createNotificationChannel = async () => {
  if (!isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: 'habit-reminders',
      name: 'Habit Reminders',
      description: 'Daily reminders for your habits',
      importance: 5, // max importance for alarm-like behavior
      visibility: 1,
      vibration: true,
      sound: 'default',
    });
  } catch (e) {
    console.error('Failed to create notification channel', e);
  }
};

// Convert string ID to a stable positive integer for notification ID
function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}
