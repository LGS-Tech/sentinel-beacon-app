import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function PrivacyScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Privacy Policy</Text>
      <Text style={settingsStyles.subtitle}>
        Read our standard zero-knowledge data end-to-end encryption guidelines.
      </Text>
    </View>
  );
}
