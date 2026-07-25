import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function VersionScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>App Version</Text>
      <Text style={settingsStyles.subtitle}>
        Sentinel Beacon App — Build v1.0.0 (Stable).
      </Text>
    </View>
  );
}
