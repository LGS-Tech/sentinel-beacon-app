import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Switch,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";

type ToggleKey = keyof NotificationPrefs;

const rows: { key: ToggleKey; label: string; description: string }[] = [
  {
    key: "facilities",
    label: "Facilities (Cleaning)",
    description: "New and updated facilities tickets",
  },
  {
    key: "itSupport",
    label: "IT Support",
    description: "IT service tickets and updates",
  },
  {
    key: "engineering",
    label: "Engineering",
    description: "Engineering and plant tickets",
  },
  {
    key: "injury",
    label: "Injury",
    description: "Injury tickets (when enabled for your site)",
  },
  {
    key: "assignmentUpdates",
    label: "Assignment changes",
    description: "When a ticket is assigned or reassigned to you",
  },
  {
    key: "overdueSla",
    label: "Overdue / past target",
    description: "Tickets dwelling past target response timelines",
  },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const loaded = await loadNotificationPrefs();
        if (active) setPrefs(loaded);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  async function toggle(key: ToggleKey, value: boolean) {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await saveNotificationPrefs(next);
  }

  if (!prefs) {
    return (
      <View style={[settingsStyles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={settingsStyles.screen}>
      <View style={settingsStyles.content}>
        <Text style={settingsStyles.title}>Notifications</Text>
        <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
          Choose which ticket categories and workflow events notify you.
          Preferences are stored on this device.
        </Text>

        <View style={settingsStyles.card}>
          {rows.map((row, index) => (
            <View
              key={row.key}
              style={[
                styles.row,
                index === rows.length - 1 && settingsStyles.rowLast,
              ]}
            >
              <View style={styles.textBlock}>
                <Text style={settingsStyles.label}>{row.label}</Text>
                <Text style={settingsStyles.muted}>{row.description}</Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={(v) => toggle(row.key, v)}
                trackColor={{
                  false: "#D1D5DB",
                  true: "#FCA5A5",
                }}
                thumbColor={prefs[row.key] ? SettingsColors.primary : "#f4f4f5"}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
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
    gap: 12,
  },
  textBlock: { flex: 1, paddingRight: 8 },
});
