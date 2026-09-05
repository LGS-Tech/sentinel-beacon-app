import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sentinel.appearance.v1";

export type ThemeMode = "light" | "dark" | "system";
export type TextScale = "small" | "default" | "large" | "xlarge";

export type AppearancePrefs = {
  theme: ThemeMode;
  textScale: TextScale;
};

export const TEXT_SCALE_FACTORS: Record<TextScale, number> = {
  small: 0.9,
  default: 1,
  large: 1.12,
  xlarge: 1.25,
};

export const TEXT_SCALE_LABELS: Record<TextScale, string> = {
  small: "Small",
  default: "Default",
  large: "Large",
  xlarge: "Extra large",
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System default",
};

export const defaultAppearancePrefs: AppearancePrefs = {
  theme: "system",
  textScale: "default",
};

export async function loadAppearancePrefs(): Promise<AppearancePrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultAppearancePrefs };
    return { ...defaultAppearancePrefs, ...JSON.parse(raw) };
  } catch {
    return { ...defaultAppearancePrefs };
  }
}

export async function saveAppearancePrefs(
  prefs: AppearancePrefs
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
