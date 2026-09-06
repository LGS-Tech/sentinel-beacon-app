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
import { API_URL } from "@/lib/api";
import {
  formatBytes,
  getStorageBreakdown,
  type StorageBreakdown,
} from "@/lib/settings-storage";

export default function StorageScreen() {
  const [breakdown, setBreakdown] = useState<StorageBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setBreakdown(await getStorageBreakdown());
    } finally {
      setLoading(false);
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
      <Text style={settingsStyles.title}>Storage Usage</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Local device storage used by Sentinel Beacon preferences and session
        data. Ticket archives live in PostgreSQL, not on-device.
      </Text>

      {loading || !breakdown ? (
        <ActivityIndicator color={SettingsColors.primary} />
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <SummaryTile
              label="Total local"
              value={formatBytes(breakdown.totalBytes)}
            />
            <SummaryTile
              label="Session"
              value={formatBytes(breakdown.sessionBytes)}
            />
            <SummaryTile
              label="Preferences"
              value={formatBytes(breakdown.cacheBytes)}
            />
          </View>

          <Text style={settingsStyles.sectionTitle}>Breakdown by item</Text>
          <View style={settingsStyles.card}>
            {breakdown.items.length === 0 ? (
              <Text style={[settingsStyles.muted, { padding: 14 }]}>
                No local data stored yet.
              </Text>
            ) : (
              breakdown.items.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    index === breakdown.items.length - 1 &&
                      settingsStyles.rowLast,
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={settingsStyles.label}>{item.label}</Text>
                    <Text style={settingsStyles.muted}>{item.key}</Text>
                  </View>
                  <Text style={styles.bytes}>{formatBytes(item.bytes)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={[settingsStyles.card, { padding: 14, marginTop: 16 }]}>
            <Text style={styles.noteTitle}>Remote API</Text>
            <Text style={settingsStyles.muted}>{API_URL}</Text>
            <Text style={[settingsStyles.muted, { marginTop: 8 }]}>
              Cases, users, and analytics are stored in PostgreSQL on the server.
            </Text>
          </View>
        </>
      )}

      <Pressable style={settingsStyles.secondaryButton} onPress={load}>
        <Text style={settingsStyles.secondaryButtonText}>Refresh</Text>
      </Pressable>
    </ScrollView>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  tile: {
    flex: 1,
    backgroundColor: SettingsColors.card,
    borderWidth: 1,
    borderColor: SettingsColors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  tileValue: {
    fontSize: 16,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 11,
    color: SettingsColors.muted,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 12,
  },
  bytes: {
    fontSize: 13,
    fontWeight: "700",
    color: SettingsColors.text,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 4,
  },
});
