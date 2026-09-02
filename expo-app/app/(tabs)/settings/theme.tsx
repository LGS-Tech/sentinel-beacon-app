import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import { useAppearance } from "@/contexts/appearance";
import {
  saveAppearancePrefs,
  THEME_LABELS,
  type ThemeMode,
} from "@/lib/appearance-prefs";

const options: ThemeMode[] = ["light", "dark", "system"];

export default function ThemeScreen() {
  const { prefs, refresh, colorScheme } = useAppearance();
  const [selected, setSelected] = useState<ThemeMode>(prefs.theme);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSelected(prefs.theme);
    }, [prefs.theme])
  );

  async function choose(theme: ThemeMode) {
    setSelected(theme);
    setSaving(true);
    try {
      await saveAppearancePrefs({ ...prefs, theme });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Appearance Theme</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Choose how Sentinel Beacon looks on this device. System default follows
        your OS light/dark setting.
      </Text>

      <View
        style={[
          styles.preview,
          colorScheme === "dark" ? styles.previewDark : styles.previewLight,
        ]}
      >
        <Text
          style={[
            styles.previewTitle,
            colorScheme === "dark" ? styles.previewTextDark : styles.previewTextLight,
          ]}
        >
          Preview
        </Text>
        <Text
          style={[
            styles.previewBody,
            colorScheme === "dark" ? styles.previewTextDark : styles.previewTextLight,
          ]}
        >
          Currently using {colorScheme} navigation theme
        </Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Theme mode</Text>
      <View style={settingsStyles.card}>
        {options.map((theme, index) => {
          const active = selected === theme;
          return (
            <Pressable
              key={theme}
              style={[
                styles.optionRow,
                index === options.length - 1 && settingsStyles.rowLast,
              ]}
              onPress={() => choose(theme)}
              disabled={saving}
            >
              <View>
                <Text style={settingsStyles.label}>{THEME_LABELS[theme]}</Text>
                <Text style={settingsStyles.muted}>
                  {theme === "system"
                    ? "Match device appearance"
                    : `Always use ${theme} mode`}
                </Text>
              </View>
              <View style={[styles.radio, active && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      {saving ? (
        <ActivityIndicator
          color={SettingsColors.primary}
          style={{ marginTop: 16 }}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  preview: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  previewLight: {
    backgroundColor: "#FFFFFF",
    borderColor: SettingsColors.border,
  },
  previewDark: {
    backgroundColor: "#111827",
    borderColor: "#374151",
  },
  previewTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  previewBody: { fontSize: 13 },
  previewTextLight: { color: SettingsColors.text },
  previewTextDark: { color: "#F9FAFB" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  radioSelected: {
    borderColor: SettingsColors.primary,
    backgroundColor: SettingsColors.primary,
  },
});
