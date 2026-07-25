import React from "react";
import { Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";

export default function TextSizeScreen() {
  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Text Size</Text>
      <Text style={settingsStyles.subtitle}>
        Adjust the application interface font size scaling.
      </Text>
    </View>
  );
}
