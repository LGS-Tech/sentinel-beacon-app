import Constants from "expo-constants";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import { API_URL, checkApiHealth, type HealthStatus } from "@/lib/api";

const changelog = [
  "PostgreSQL API — cases, users, auth, analytics",
  "Settings wired to live backend (profile, password, integrations)",
  "Case attachment metadata routes",
  "GitHub Pages demo + Render deployment",
];

export default function VersionScreen() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checking, setChecking] = useState(true);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const appName = Constants.expoConfig?.name ?? "Sentinel Beacon";
  const sdkVersion = Constants.expoConfig?.sdkVersion ?? "—";

  const load = useCallback(async () => {
    setChecking(true);
    try {
      setHealth(await checkApiHealth());
    } finally {
      setChecking(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>App Version</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Build information for the LGS Tech campus ticketing platform.
      </Text>

      <View style={[settingsStyles.card, styles.heroCard]}>
        <Text style={styles.heroName}>{appName}</Text>
        <Text style={styles.heroVersion}>v{appVersion}</Text>
        <Text style={settingsStyles.muted}>Expo SDK {sdkVersion}</Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Environment</Text>
      <View style={settingsStyles.card}>
        <InfoRow label="API endpoint" value={API_URL} />
        <InfoRow
          label="API status"
          value={
            checking
              ? "Checking…"
              : health?.ok
                ? health.message
                : health?.message ?? "Offline"
          }
          last
        />
      </View>

      <Text style={settingsStyles.sectionTitle}>Recent highlights</Text>
      <View style={settingsStyles.card}>
        {changelog.map((line, index) => (
          <View
            key={line}
            style={[
              styles.changeRow,
              index === changelog.length - 1 && settingsStyles.rowLast,
            ]}
          >
            <Text style={styles.bullet}>•</Text>
            <Text style={settingsStyles.label}>{line}</Text>
          </View>
        ))}
      </View>

      <Pressable
        style={settingsStyles.secondaryButton}
        onPress={load}
        disabled={checking}
      >
        <Text style={settingsStyles.secondaryButtonText}>
          {checking ? "Checking API…" : "Re-check API health"}
        </Text>
      </Pressable>

      <Pressable
        style={[settingsStyles.secondaryButton, { marginTop: 0 }]}
        onPress={() =>
          Linking.openURL(
            "https://github.com/LGS-Tech/sentinel-beacon-app"
          )
        }
      >
        <Text style={settingsStyles.secondaryButtonText}>View on GitHub</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoRow, last && settingsStyles.rowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  infoRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
  },
  infoLabel: {
    fontSize: 12,
    color: SettingsColors.muted,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: SettingsColors.text,
    lineHeight: 18,
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
  bullet: {
    color: SettingsColors.primary,
    fontWeight: "700",
    marginTop: 1,
  },
});
