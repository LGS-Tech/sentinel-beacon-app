import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sentinel.notificationPrefs.v2";

/** Aligned with LGS v1 ticket categories from the Client & Features brief */
export type NotificationPrefs = {
  facilities: boolean;
  itSupport: boolean;
  engineering: boolean;
  injury: boolean;
  assignmentUpdates: boolean;
  overdueSla: boolean;
};

export const defaultNotificationPrefs: NotificationPrefs = {
  facilities: true,
  itSupport: true,
  engineering: true,
  injury: true,
  assignmentUpdates: true,
  overdueSla: true,
};

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultNotificationPrefs };
    return { ...defaultNotificationPrefs, ...JSON.parse(raw) };
  } catch {
    return { ...defaultNotificationPrefs };
  }
}

export async function saveNotificationPrefs(
  prefs: NotificationPrefs
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
