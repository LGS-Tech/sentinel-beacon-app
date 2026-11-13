import Constants from "expo-constants";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";

const highlights = [
  "Add floor plans for multiple floors and switch between them on the map.",
  "Review closed cases in the Vault.",
  "Update your profile, change your password, and manage notifications in Settings.",
];

export default function VersionScreen() {
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const appName = Constants.expoConfig?.name ?? "Sentinel Beacon";

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>App Version</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        See your current app version and what’s new.
      </Text>

      <View style={[settingsStyles.card, styles.heroCard]}>
        <Text style={styles.heroName}>{appName}</Text>
        <Text style={styles.heroVersion}>v{appVersion}</Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Recent highlights</Text>
      <View style={settingsStyles.card}>
        {highlights.map((line, index) => (
          <View
            key={line}
            style={[
              styles.changeRow,
              index === highlights.length - 1 && settingsStyles.rowLast,
            ]}
          >
            <Text style={styles.bullet}>•</Text>
            <Text style={[settingsStyles.label, styles.highlightText]}>{line}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  heroName: {
    fontSize: 18,
    fontWeight: "800",
    color: SettingsColors.primary,
    marginBottom: 4,
  },
  heroVersion: {
    fontSize: 24,
    fontWeight: "800",
    color: SettingsColors.text,
    marginBottom: 4,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 8,
  },
  highlightText: {
    flex: 1,
  },
  bullet: {
    color: SettingsColors.primary,
    fontWeight: "700",
    marginTop: 1,
  },
});
