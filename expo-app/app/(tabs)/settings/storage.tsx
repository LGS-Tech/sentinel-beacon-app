import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function StorageScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Storage Usage</Text>
      <Text style={settingsStyles.subtitle}>
        Review encrypted files and active vault storage details.
      </Text>
    </View>
  );
}
