import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface CustomRingtone {
  name: string;
  path: string; // stored path on device
}

const RINGTONES_KEY = 'custom_ringtones';

export const loadSavedRingtones = (): CustomRingtone[] => {
  try {
    const data = localStorage.getItem(RINGTONES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveRingtones = (ringtones: CustomRingtone[]) => {
  localStorage.setItem(RINGTONES_KEY, JSON.stringify(ringtones));
};

export const pickAndSaveRingtone = async (): Promise<CustomRingtone | null> => {
  // Use a file input to pick an audio file
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const name = file.name.replace(/\.[^.]+$/, ''); // remove extension

      if (Capacitor.isNativePlatform()) {
        try {
          // Read file as base64 and save to app directory
          const reader = new FileReader();
          reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const fileName = `ringtone_${Date.now()}_${file.name}`;

            await Filesystem.writeFile({
              path: `ringtones/${fileName}`,
              data: base64Data,
              directory: Directory.Data,
              recursive: true,
            });

            const ringtone: CustomRingtone = {
              name,
              path: `ringtones/${fileName}`,
            };

            const existing = loadSavedRingtones();
            existing.push(ringtone);
            saveRingtones(existing);
            resolve(ringtone);
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Failed to save ringtone', err);
          resolve(null);
        }
      } else {
        // Web fallback - just save reference
        const ringtone: CustomRingtone = { name, path: file.name };
        const existing = loadSavedRingtones();
        existing.push(ringtone);
        saveRingtones(existing);
        resolve(ringtone);
      }
    };
    input.click();
  });
};

export const deleteRingtone = async (path: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Filesystem.deleteFile({ path, directory: Directory.Data });
    } catch {
      // ignore
    }
  }
  const existing = loadSavedRingtones().filter((r) => r.path !== path);
  saveRingtones(existing);
};
