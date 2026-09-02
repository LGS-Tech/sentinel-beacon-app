import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  API_URL,
  clearSession,
  getAccessLevelLabel,
  getCurrentUserId,
  getUser,
  getUserPhone,
  hydrateSession,
  type User,
} from "@/lib/api";

export default function SignOutScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        try {
          await hydrateSession();
          const loaded = await getUser(getCurrentUserId());
          if (active) setUser(loaded);
        } catch {
          if (active) setUser(null);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  async function onConfirm() {
    setBusy(true);
    try {
      await clearSession();
      router.replace("/login-page");
    } catch (e) {
      Alert.alert(
        "Sign out failed",
        e instanceof Error ? e.message : "Could not clear session."
      );
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Sign Out</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Signing out clears your JWT session on this device. You will need to
        authenticate again against the PostgreSQL backend.
      </Text>

      {loading ? (
        <ActivityIndicator color={SettingsColors.primary} />
      ) : (
        <View style={[settingsStyles.card, styles.sessionCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name?.[0] ?? "?").toUpperCase()}
            </Text>
          </View>
          <View style={styles.sessionText}>
            <Text style={styles.sessionName}>{user?.name ?? "Unknown user"}</Text>
            <Text style={settingsStyles.muted}>{user?.email ?? "No email loaded"}</Text>
            {user ? (
              <Text style={settingsStyles.muted}>
                {user.role} · {getAccessLevelLabel(user.authorisation)}
              </Text>
            ) : null}
            {user ? (
              <Text style={styles.phone}>{getUserPhone(user) || "No phone on file"}</Text>
            ) : null}
          </View>
        </View>
      )}

      <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
        <Text style={styles.noteTitle}>What happens next</Text>
        <Text style={styles.noteLine}>• Local auth token is removed from this device</Text>
        <Text style={styles.noteLine}>• Ticket preferences and notifications stay on this device</Text>
        <Text style={styles.noteLine}>• API endpoint: {API_URL}</Text>
      </View>

      <Pressable
        style={[settingsStyles.primaryButton, busy && { opacity: 0.7 }]}
        onPress={onConfirm}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={settingsStyles.primaryButtonText}>Sign out</Text>
        )}
      </Pressable>

      <Pressable
        style={settingsStyles.secondaryButton}
        onPress={() => router.back()}
        disabled={busy}
      >
        <Text style={settingsStyles.secondaryButtonText}>Stay signed in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SettingsColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sessionText: { flex: 1 },
  sessionName: {
    fontSize: 16,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 2,
  },
  phone: { fontSize: 12, color: SettingsColors.muted, marginTop: 4 },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 6,
  },
  noteLine: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 20,
  },
});
