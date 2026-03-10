import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const isNativePlatform = () => Capacitor.isNativePlatform();

// Store sound mappings for playback on notification receive
const soundMap = new Map<number, string>();

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

  // Store sound path for playback when notification fires
  if (customSoundPath) {
    soundMap.set(notifId, customSoundPath);
    saveSoundMap();
  } else {
    soundMap.delete(notifId);
    saveSoundMap();
  }

  const scheduleOptions: ScheduleOptions = {
    notifications: [
      {
        id: notifId,
        title: `⏰ ${habitIcon} ${habitName}`,
        body: `Time for your habit: ${habitName}! Stay consistent 💪`,
        schedule: {
          on: { hour: hours, minute: minutes },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'beep.mp3',
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
        channelId: 'habit-alarms',
        extra: {
          habitId,
          customSound: customSoundPath || '',
        },
      },
    ],
  };

  try {
    await LocalNotifications.schedule(scheduleOptions);
    console.log(`Scheduled alarm for "${habitName}" at ${reminderTime}`);
  } catch (e) {
    console.error('Failed to schedule notification', e);
  }
};

export const cancelHabitReminder = async (habitId: string) => {
  if (!isNativePlatform()) return;
  const notifId = hashStringToInt(habitId);
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
    soundMap.delete(notifId);
    saveSoundMap();
  } catch {
    // ignore
  }
};

export const createNotificationChannel = async () => {
  if (!isNativePlatform()) return;
  try {
    // Create a high-priority alarm channel
    await LocalNotifications.createChannel({
      id: 'habit-alarms',
      name: 'Habit Alarms',
      description: 'Alarm-style reminders for your habits',
      importance: 5, // MAX importance - shows as heads-up notification with sound
      visibility: 1, // public
      vibration: true,
      sound: 'beep.mp3',
      lights: true,
      lightColor: '#22c55e',
    });
    console.log('Notification channel created: habit-alarms');
  } catch (e) {
    console.error('Failed to create notification channel', e);
  }
};

/**
 * Initialize notification listeners for foreground sound playback.
 * Call once at app startup.
 */
export const initNotificationListeners = () => {
  if (!isNativePlatform()) return;

  loadSoundMap();

  // When notification is received while app is in foreground
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification received in foreground:', notification.id);
    const customSound = notification.extra?.customSound;
    if (customSound) {
      playCustomSound(customSound);
    }
  });

  // When user taps on notification
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('Notification tapped:', action.notification.id);
    // Stop any playing sound when user interacts
    stopSound();
  });
};

// Audio playback for custom alarm sounds
let currentAudio: HTMLAudioElement | null = null;

const playCustomSound = async (soundPath: string) => {
  try {
    stopSound();

    // Try to get the file URI from Capacitor filesystem
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const result = await Filesystem.getUri({
      path: soundPath,
      directory: Directory.Data,
    });

    currentAudio = new Audio(Capacitor.convertFileSrc(result.uri));
    currentAudio.loop = true; // Loop like an alarm
    currentAudio.volume = 1.0;
    await currentAudio.play();

    // Auto-stop after 30 seconds to prevent battery drain
    setTimeout(() => stopSound(), 30000);
  } catch (e) {
    console.error('Failed to play custom sound:', e);
  }
};

export const stopSound = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }
};

// Persist sound mappings so they survive app restarts
const SOUND_MAP_KEY = 'notification_sound_map';

const saveSoundMap = () => {
  try {
    const obj: Record<string, string> = {};
    soundMap.forEach((v, k) => { obj[k.toString()] = v; });
    localStorage.setItem(SOUND_MAP_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
};

const loadSoundMap = () => {
  try {
    const data = localStorage.getItem(SOUND_MAP_KEY);
    if (data) {
      const obj = JSON.parse(data) as Record<string, string>;
      Object.entries(obj).forEach(([k, v]) => soundMap.set(Number(k), v));
    }
  } catch { /* ignore */ }
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
