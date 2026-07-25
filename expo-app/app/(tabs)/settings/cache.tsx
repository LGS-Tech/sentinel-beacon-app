import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function CacheScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Clear Cache</Text>
      <Text style={settingsStyles.subtitle}>
        Wipe temporary layout assets to free up memory safety.
      </Text>
    </View>
  );
}
