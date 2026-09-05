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
import { useAppearance } from "@/contexts/appearance";
import { defaultNotificationPrefs } from "@/lib/notification-prefs";
import {
  clearAppCache,
  formatBytes,
  getStorageBreakdown,
} from "@/lib/settings-storage";
import { defaultTicketPrefs } from "@/lib/ticket-prefs";

export default function CacheScreen() {
  const { refresh } = useAppearance();
  const [cacheBytes, setCacheBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const breakdown = await getStorageBreakdown();
      setCacheBytes(breakdown.cacheBytes);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onClear() {
    Alert.alert(
      "Clear local cache?",
      "This removes ticket preferences, notification settings, and appearance choices. Your login session will stay active.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setClearing(true);
            try {
              const cleared = await clearAppCache();
              await refresh();
              await load();
              Alert.alert(
                "Cache cleared",
                cleared.length > 0
                  ? `Removed: ${cleared.join(", ")}`
                  : "Nothing to clear."
              );
            } catch (e) {
              Alert.alert(
                "Failed",
                e instanceof Error ? e.message : "Could not clear cache."
              );
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Clear Cache</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Free up local space by resetting preferences cached on this device.
        Your PostgreSQL account and sign-in token are not removed.
      </Text>

      {loading ? (
        <ActivityIndicator color={SettingsColors.primary} />
      ) : (
        <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
          <Text style={styles.metricLabel}>Clearable preferences</Text>
          <Text style={styles.metricValue}>{formatBytes(cacheBytes)}</Text>
        </View>
      )}

      <Text style={settingsStyles.sectionTitle}>What gets reset</Text>
      <View style={settingsStyles.card}>
        <CacheRow
          label="Ticket preferences"
          detail={`Default category: ${defaultTicketPrefs.defaultCategory}`}
        />
        <CacheRow
          label="Notification preferences"
          detail={`Master enabled: ${defaultNotificationPrefs.enabled ? "yes" : "no"}`}
        />
        <CacheRow
          label="Appearance"
          detail="Theme and text size reset to defaults"
          last
        />
      </View>

      <Text style={settingsStyles.sectionTitle}>What stays</Text>
      <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
        <Text style={styles.keepLine}>• Auth session (JWT + user id)</Text>
        <Text style={styles.keepLine}>• PostgreSQL account data on the server</Text>
        <Text style={styles.keepLine}>• Vault and cases in the remote database</Text>
      </View>

      <Pressable
        style={[settingsStyles.primaryButton, clearing && { opacity: 0.7 }]}
        onPress={onClear}
        disabled={clearing}
      >
        {clearing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={settingsStyles.primaryButtonText}>Clear local cache</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function CacheRow({
  label,
  detail,
  last,
}: {
  label: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && settingsStyles.rowLast]}>
      <View>
        <Text style={settingsStyles.label}>{label}</Text>
        <Text style={settingsStyles.muted}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metricLabel: {
    fontSize: 12,
    color: SettingsColors.muted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "800",
    color: SettingsColors.text,
    marginTop: 4,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
  },
  keepLine: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 22,
  },
});
