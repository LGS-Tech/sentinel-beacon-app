// Live activity feed shown during incidents

import React from "react";
import { StyleSheet, Text, View } from "react-native";

type LogItem = {
  time: string;
  message: string;
};

const LOGS: LogItem[] = [
  {
    time: "14:32",
    message: "Movement noticed near the front entrance",
  },
  {
    time: "14:32",
    message: "Mrs Smith messaged: 'Spotted a male in the corridor outside C1. He has a red hoodie and white trainers, looks like he's in his early 20s'",
  },
  {
    time: "14:33",
    message: "Mrs Smith updated the location of the suspect",
  },
  {
    time: "14:34",
    message: "Mrs Martin uploaded a picture of the suspect",
  },
  {
    time: "14:36",
    message: "Mr Albot messaged: 'Police have been notified and are on the way'",
  },
  {
    time: "14:37",
    message: "Mr Wallace updated the location of the suspect",
  },
];

export default function LiveFeedSheet() {
  return (
    <View>
      <Text style={styles.title}>Live Updates</Text>

      <View style={styles.logContainer}>
        {LOGS.map((log, index) => (
          <View key={index} style={styles.logRow}>
            <Text style={styles.time}>{log.time}</Text>
            <Text style={styles.message}>{log.message}</Text>
          </View>
        ))}
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

  logContainer: {
    borderRadius: 12,
    backgroundColor: "#F4F6F9",
    paddingVertical: 8,
  },

  logRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E5EA",
  },

  time: {
    width: 60,
    fontWeight: "700",
    color: "#E53935",
    fontSize: 14,
  },

  message: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
});
