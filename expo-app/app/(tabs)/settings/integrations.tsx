import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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
  EXPRESS_URL,
  FLASK_URL,
  checkAnalyticsHealth,
  checkExpressHealth,
  checkFlaskHealth,
  checkUsersHealth,
  type HealthStatus,
} from "@/lib/api";

type IntegrationId = "postgres" | "cases" | "users" | "analytics" | "flask" | "map" | "vault";

type IntegrationRow = {
  id: IntegrationId;
  title: string;
  detail: string;
  status: HealthStatus;
};

export default function IntegrationsScreen() {
  const [rows, setRows] = useState<IntegrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const probe = useCallback(async () => {
    const [postgres, cases, users, analytics, flask] = await Promise.all([
      checkExpressHealth(),
      checkExpressHealth(),
      checkUsersHealth(),
      checkAnalyticsHealth(),
      checkFlaskHealth(),
    ]);

    setRows([
      {
        id: "postgres",
        title: "PostgreSQL API",
        detail: `${EXPRESS_URL}/health`,
        status: postgres,
      },
      {
        id: "cases",
        title: "Cases API",
        detail: `${EXPRESS_URL}/cases`,
        status: cases,
      },
      {
        id: "users",
        title: "Users API (Settings)",
        detail: `${EXPRESS_URL}/users`,
        status: users,
      },
      {
        id: "analytics",
        title: "Analytics API",
        detail: `${EXPRESS_URL}/cases/analytics`,
        status: analytics,
      },
      {
        id: "flask",
        title: "Flask alerts",
        detail: `${FLASK_URL}/api/v1/intruder/path`,
        status: flask,
      },
      {
        id: "map",
        title: "Map assets",
        detail: "Local floor-plan images bundled in the app",
        status: { ok: true, message: "Local" },
      },
      {
        id: "vault",
        title: "Vault",
        detail: "Ticket archive via Cases API",
        status: cases.ok
          ? { ok: true, message: "Connected" }
          : { ok: false, message: "Cases API offline" },
      },
    ]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        await probe();
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [probe])
  );

  async function onRefresh() {
    setRefreshing(true);
    await probe();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={SettingsColors.primary}
        />
      }
    >
      <Text style={settingsStyles.title}>Integrations</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Connection status for PostgreSQL, Dashboard, Analytics, Vault, and
        alerts. Pull to refresh or tap Refresh.
      </Text>

      {loading && rows.length === 0 ? (
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      ) : (
        <View style={settingsStyles.card}>
          {rows.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.row,
                index === rows.length - 1 && settingsStyles.rowLast,
              ]}
            >
              <View style={styles.left}>
                <Text style={settingsStyles.label}>{row.title}</Text>
                <Text style={settingsStyles.muted} numberOfLines={2}>
                  {row.detail}
                </Text>
                {!row.status.ok ? (
                  <Text style={styles.errorDetail} numberOfLines={2}>
                    {row.status.message}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: row.status.ok
                      ? "#DCFCE7"
                      : "#FEE2E2",
                  },
                ]}
              >
                <MaterialIcons
                  name={row.status.ok ? "check-circle" : "error-outline"}
                  size={14}
                  color={
                    row.status.ok
                      ? SettingsColors.success
                      : SettingsColors.primary
                  }
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: row.status.ok
                      ? SettingsColors.success
                      : SettingsColors.primary,
                  }}
                >
                  {row.status.ok ? row.status.message : "Offline"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={settingsStyles.primaryButton}
        onPress={onRefresh}
        disabled={refreshing}
      >
        <Text style={settingsStyles.primaryButtonText}>
          {refreshing ? "Refreshing…" : "Refresh status"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 10,
  },
  left: { flex: 1, paddingRight: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  errorDetail: {
    fontSize: 12,
    color: SettingsColors.primary,
    marginTop: 4,
  },
});
