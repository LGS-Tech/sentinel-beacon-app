import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";

export function SettingsToggleRow({
  label,
  description,
  value,
  onChange,
  last,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.row, last && settingsStyles.rowLast]}>
      <View style={styles.textBlock}>
        <Text style={settingsStyles.label}>{label}</Text>
        {description ? (
          <Text style={settingsStyles.muted}>{description}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
        thumbColor={value ? SettingsColors.primary : "#f4f4f5"}
      />
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
