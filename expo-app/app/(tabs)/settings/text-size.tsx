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
  TEXT_SCALE_FACTORS,
  TEXT_SCALE_LABELS,
  type TextScale,
} from "@/lib/appearance-prefs";

const scales: TextScale[] = ["small", "default", "large", "xlarge"];

export default function TextSizeScreen() {
  const { prefs, refresh, fontScale } = useAppearance();
  const [selected, setSelected] = useState<TextScale>(prefs.textScale);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSelected(prefs.textScale);
    }, [prefs.textScale])
  );

  async function choose(scale: TextScale) {
    setSelected(scale);
    setSaving(true);
    try {
      await saveAppearancePrefs({ ...prefs, textScale: scale });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  const previewScale = TEXT_SCALE_FACTORS[selected];

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Text Size</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Adjust interface text scaling for readability. Settings screens use your
        chosen size; other tabs adopt this in upcoming releases.
      </Text>

      <View style={[settingsStyles.card, styles.previewCard]}>
        <Text style={[styles.previewHeading, { fontSize: 18 * previewScale }]}>
          Ticket raised successfully
        </Text>
        <Text style={[styles.previewBody, { fontSize: 14 * previewScale }]}>
          Facilities · Cafeteria · Assigned to Estates team
        </Text>
        <Text style={[styles.previewMeta, { fontSize: 12 * previewScale }]}>
          Preview at {Math.round(previewScale * 100)}% scale
        </Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Size preset</Text>
      <View style={settingsStyles.card}>
        {scales.map((scale, index) => {
          const active = selected === scale;
          return (
            <Pressable
              key={scale}
              style={[
                styles.optionRow,
                index === scales.length - 1 && settingsStyles.rowLast,
              ]}
              onPress={() => choose(scale)}
              disabled={saving}
            >
              <View>
                <Text
                  style={[
                    settingsStyles.label,
                    { fontSize: 15 * TEXT_SCALE_FACTORS[scale] },
                  ]}
                >
                  {TEXT_SCALE_LABELS[scale]}
                </Text>
                <Text style={settingsStyles.muted}>
                  {Math.round(TEXT_SCALE_FACTORS[scale] * 100)}% of default
                </Text>
              </View>
              <View style={[styles.radio, active && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[settingsStyles.muted, { marginTop: 12 }]}>
        Current app scale factor: {fontScale.toFixed(2)}×
      </Text>

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
  previewCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  previewHeading: {
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 6,
  },
  previewBody: {
    color: SettingsColors.muted,
    marginBottom: 8,
  },
  previewMeta: {
    color: SettingsColors.primary,
    fontWeight: "600",
  },
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
