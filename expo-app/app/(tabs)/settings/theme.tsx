import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function ThemeScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Appearance Theme</Text>
      <Text style={settingsStyles.subtitle}>
        Switch between Light, Dark, or System default modes.
      </Text>
    </View>
  );
}
