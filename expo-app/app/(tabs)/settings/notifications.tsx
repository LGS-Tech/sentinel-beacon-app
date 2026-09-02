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

import { SettingsToggleRow } from "@/components/settings-toggle-row";
import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  defaultNotificationPrefs,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/notification-prefs";

type ToggleKey = Exclude<keyof NotificationPrefs, "enabled">;

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
  {
    key: "digestSummary",
    label: "Daily digest",
    description: "One summary notification per day instead of every event",
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

  async function patch(partial: Partial<NotificationPrefs>) {
    if (!prefs) return;
    const next = { ...prefs, ...partial };
    setPrefs(next);
    await saveNotificationPrefs(next);
  }

  async function resetDefaults() {
    setPrefs({ ...defaultNotificationPrefs });
    await saveNotificationPrefs({ ...defaultNotificationPrefs });
    Alert.alert("Reset", "Notification preferences restored to defaults.");
  }

  if (!prefs) {
    return (
      <View style={[settingsStyles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      </View>
    );
  }

  const categoryCount = rows.filter((row) => prefs[row.key]).length;

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Notifications</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Control which ticket categories and workflow events notify you on this
        device. Push delivery will connect when mobile alerts ship.
      </Text>

      <View style={[settingsStyles.card, { marginBottom: 16 }]}>
        <SettingsToggleRow
          label="Enable notifications"
          description="Master switch for all categories below"
          value={prefs.enabled}
          onChange={(enabled) => patch({ enabled })}
        />
        <View style={[styles.statRow, settingsStyles.rowLast]}>
          <Text style={settingsStyles.muted}>
            {prefs.enabled
              ? `${categoryCount} of ${rows.length} notification types active`
              : "All notifications paused"}
          </Text>
        </View>
      </View>

      <Text style={settingsStyles.sectionTitle}>Categories & events</Text>
      <View style={settingsStyles.card}>
        {rows.map((row, index) => (
          <SettingsToggleRow
            key={row.key}
            label={row.label}
            description={row.description}
            value={prefs[row.key]}
            onChange={(value) => patch({ [row.key]: value })}
            disabled={!prefs.enabled}
            last={index === rows.length - 1}
          />
        ))}
      </View>

      <Pressable style={settingsStyles.secondaryButton} onPress={resetDefaults}>
        <Text style={settingsStyles.secondaryButtonText}>Reset to defaults</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statRow: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
});
