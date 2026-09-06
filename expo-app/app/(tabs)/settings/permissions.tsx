import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";

type PermissionItem = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  status: "granted" | "limited" | "denied" | "unknown";
  guidance: string;
};

const permissions: PermissionItem[] = [
  {
    id: "camera",
    icon: "photo-camera",
    title: "Camera",
    description: "Attach photos when raising or updating a ticket.",
    status: Platform.OS === "web" ? "unknown" : "unknown",
    guidance:
      Platform.OS === "web"
        ? "Browser will prompt when you capture evidence."
        : "Enable in system settings when attaching images.",
  },
  {
    id: "location",
    icon: "location-on",
    title: "Location / map pin",
    description: "Pin tickets on the Dashboard floor-plan map.",
    status: "unknown",
    guidance: "Map pins use floor-plan coordinates; GPS is optional.",
  },
  {
    id: "notifications",
    icon: "notifications-active",
    title: "Notifications",
    description: "Receive assignment and SLA alerts for your tickets.",
    status: "unknown",
    guidance: "Controlled in Settings → Notifications and system settings.",
  },
  {
    id: "storage",
    icon: "folder-open",
    title: "Local storage",
    description: "Cache preferences and session data on this device.",
    status: "granted",
    guidance: "Used for login session, ticket defaults, and appearance.",
  },
];

function statusLabel(status: PermissionItem["status"]): string {
  switch (status) {
    case "granted":
      return "Granted";
    case "limited":
      return "Limited";
    case "denied":
      return "Denied";
    default:
      return "Check on use";
  }
}

function statusColor(status: PermissionItem["status"]): string {
  switch (status) {
    case "granted":
      return SettingsColors.success;
    case "limited":
      return SettingsColors.warning;
    case "denied":
      return SettingsColors.primary;
    default:
      return SettingsColors.muted;
  }
}

export default function PermissionsScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  async function openSystemSettings() {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("app-settings:");
      } else if (Platform.OS === "android") {
        await Linking.openSettings();
      }
    } catch {
      // no-op on web / unsupported
    }
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Permissions</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Sentinel Beacon needs a few device capabilities for evidence capture,
        map pins, and notifications. Tap a row for guidance.
      </Text>

      <View style={settingsStyles.card}>
        {permissions.map((item, index) => {
          const isOpen = expanded === item.id;
          return (
            <Pressable
              key={item.id}
              style={[
                styles.row,
                index === permissions.length - 1 && settingsStyles.rowLast,
              ]}
              onPress={() => setExpanded(isOpen ? null : item.id)}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={SettingsColors.primary}
                style={styles.icon}
              />
              <View style={styles.textBlock}>
                <View style={styles.titleRow}>
                  <Text style={settingsStyles.label}>{item.title}</Text>
                  <Text
                    style={[
                      styles.status,
                      { color: statusColor(item.status) },
                    ]}
                  >
                    {statusLabel(item.status)}
                  </Text>
                </View>
                <Text style={settingsStyles.muted}>{item.description}</Text>
                {isOpen ? (
                  <Text style={styles.guidance}>{item.guidance}</Text>
                ) : null}
              </View>
              <MaterialIcons
                name={isOpen ? "expand-less" : "expand-more"}
                size={22}
                color={SettingsColors.muted}
              />
            </Pressable>
          );
        })}
      </View>

      {Platform.OS !== "web" ? (
        <Pressable
          style={settingsStyles.primaryButton}
          onPress={openSystemSettings}
        >
          <Text style={settingsStyles.primaryButtonText}>
            Open system settings
          </Text>
        </Pressable>
      ) : (
        <Text style={[settingsStyles.muted, { marginTop: 16 }]}>
          On web, permissions are requested by the browser when you use camera
          or notification features.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 8,
  },
  icon: { marginTop: 2 },
  textBlock: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  status: { fontSize: 12, fontWeight: "700" },
  guidance: {
    fontSize: 12,
    color: SettingsColors.text,
    marginTop: 8,
    lineHeight: 18,
  },
});
