// Chat panel for real-time coordination between school staff

import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatSheet() {
  return (
    <View>
      <Text style={styles.title}>Team Chat</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Messages will show up here as they come in
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  placeholder: {
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    color: "#666",
    fontSize: 15,
  },
});
