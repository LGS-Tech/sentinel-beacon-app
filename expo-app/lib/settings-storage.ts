import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEYS = new Set(["sentinel.currentUserId", "sentinel.authToken"]);

const KEY_LABELS: Record<string, string> = {
  "sentinel.ticketPrefs.v1": "Ticket preferences",
  "sentinel.notificationPrefs.v2": "Notification preferences",
  "sentinel.appearance.v1": "Appearance settings",
  "sentinel.currentUserId": "Signed-in user id",
  "sentinel.authToken": "Auth session token",
};

export type StorageItem = {
  key: string;
  label: string;
  bytes: number;
};

export type StorageBreakdown = {
  items: StorageItem[];
  totalBytes: number;
  sessionBytes: number;
  cacheBytes: number;
};

function labelForKey(key: string): string {
  return KEY_LABELS[key] ?? key.replace(/^sentinel\./, "");
}

function byteLength(value: string | null): number {
  if (!value) return 0;
  try {
    return new TextEncoder().encode(value).length;
  } catch {
    return value.length * 2;
  }
}

export async function getStorageBreakdown(): Promise<StorageBreakdown> {
  const keys = await AsyncStorage.getAllKeys();
  const entries = await AsyncStorage.multiGet(keys);

  const items: StorageItem[] = entries
    .map(([key, value]) => ({
      key,
      label: labelForKey(key),
      bytes: byteLength(value),
    }))
    .sort((a, b) => b.bytes - a.bytes);

  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);
  const sessionBytes = items
    .filter((item) => SESSION_KEYS.has(item.key))
    .reduce((sum, item) => sum + item.bytes, 0);
  const cacheBytes = totalBytes - sessionBytes;

  return { items, totalBytes, sessionBytes, cacheBytes };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Clears local prefs/cache but keeps login session. */
export async function clearAppCache(): Promise<string[]> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter((key) => !SESSION_KEYS.has(key));
  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }
  return toRemove.map(labelForKey);
}
