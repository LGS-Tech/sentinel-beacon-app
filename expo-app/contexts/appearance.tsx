import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme as useSystemScheme } from "react-native";

import {
  defaultAppearancePrefs,
  loadAppearancePrefs,
  TEXT_SCALE_FACTORS,
  type AppearancePrefs,
} from "@/lib/appearance-prefs";

type AppearanceContextValue = {
  prefs: AppearancePrefs;
  refresh: () => Promise<void>;
  fontScale: number;
  colorScheme: "light" | "dark";
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemScheme();
  const [prefs, setPrefs] = useState<AppearancePrefs>(defaultAppearancePrefs);

  const refresh = useCallback(async () => {
    setPrefs(await loadAppearancePrefs());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const colorScheme: "light" | "dark" =
    prefs.theme === "system"
      ? system === "dark"
        ? "dark"
        : "light"
      : prefs.theme;

  const value = useMemo(
    () => ({
      prefs,
      refresh,
      fontScale: TEXT_SCALE_FACTORS[prefs.textScale],
      colorScheme,
    }),
    [prefs, refresh, colorScheme]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    throw new Error("useAppearance must be used within AppearanceProvider");
  }
  return ctx;
}
