import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";

const permissions = [
  {
    id: "camera",
    icon: "photo-camera" as const,
    title: "Camera",
    description: "Attach photos when raising or updating a ticket.",
  },
  {
    id: "location",
    icon: "location-on" as const,
    title: "Location / map pin",
    description: "Pin tickets on the Dashboard floor-plan map with a timestamp.",
  },
  {
    id: "storage",
    icon: "folder-open" as const,
    title: "Storage",
    description: "Keep ticket evidence and archives available in the Vault.",
  },
];

export default function PermissionsScreen() {
  async function openSystemSettings() {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("app-settings:");
      } else {
        await Linking.openSettings();
      }
    } catch {
      // no-op on web / unsupported
    }
  }

  return (
    <View style={settingsStyles.screen}>
      <View style={settingsStyles.content}>
        <Text style={settingsStyles.title}>Permissions</Text>
        <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
          Needed so the ticketing workflow can capture evidence, place map pins,
          and archive cases.
        </Text>

        <View style={settingsStyles.card}>
          {permissions.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.row,
                index === permissions.length - 1 && settingsStyles.rowLast,
              ]}
            >
              <MaterialIcons
                name={item.icon}
                size={24}
                color={SettingsColors.primary}
                style={styles.icon}
              />
              <View style={styles.textBlock}>
                <Text style={settingsStyles.label}>{item.title}</Text>
                <Text style={settingsStyles.muted}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          style={settingsStyles.primaryButton}
          onPress={openSystemSettings}
        >
          <Text style={settingsStyles.primaryButtonText}>
            Open system settings
          </Text>
        </Pressable>
      </View>
    </View>
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
  },
  icon: { marginRight: 12, marginTop: 2 },
  textBlock: { flex: 1 },
});
