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
import {
  getAccessLevelLabel,
  getAccessResponsibilities,
  getCurrentUserId,
  getUser,
  hydrateSession,
  type User,
} from "@/lib/api";

export default function RolesAccessScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await hydrateSession();
      const loaded = await getUser(getCurrentUserId());
      setUser(loaded);
      if (!loaded) setError("User not found on the API.");
    } catch (e) {
      setUser(null);
      setError(
        e instanceof Error
          ? e.message
          : "Could not load access. Is the backend API running?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={[settingsStyles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      </View>
    );
  }

  const responsibilities = getAccessResponsibilities(user?.authorisation);

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Roles & Access</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Different roles allow different responsibilities or priority status on
        the ticketing platform.
      </Text>

      {error ? (
        <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
          <Text style={{ color: SettingsColors.primary, marginBottom: 8 }}>
            {error}
          </Text>
          <Pressable style={settingsStyles.secondaryButton} onPress={load}>
            <Text style={settingsStyles.secondaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
        <Text style={styles.metaLabel}>Signed-in role</Text>
        <Text style={styles.metaValue}>{user?.role ?? "—"}</Text>
        <Text style={[styles.metaLabel, { marginTop: 12 }]}>Access level</Text>
        <Text style={styles.metaValue}>
          {getAccessLevelLabel(user?.authorisation)}
          {user?.authorisation != null
            ? ` (authorisation ${user.authorisation})`
            : ""}
        </Text>
        <Text style={[styles.metaLabel, { marginTop: 12 }]}>Account</Text>
        <Text style={styles.metaValue}>
          {user?.name ?? "—"} · {user?.email ?? "—"}
        </Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Responsibilities</Text>
      <View style={settingsStyles.card}>
        {responsibilities.map((item, index) => (
          <View
            key={item}
            style={[
              styles.row,
              index === responsibilities.length - 1 && settingsStyles.rowLast,
            ]}
          >
            <View style={styles.bullet} />
            <Text style={[settingsStyles.label, { flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metaLabel: {
    fontSize: 12,
    color: SettingsColors.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 16,
    color: SettingsColors.text,
    fontWeight: "600",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SettingsColors.primary,
    marginTop: 6,
  },
});
