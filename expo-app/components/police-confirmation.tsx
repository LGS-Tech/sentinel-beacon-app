import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PoliceConfirmationProps = {
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function PoliceConfirmation({
  message = "Are you sure you want to notify the emergency services?",
  onConfirm,
  onCancel,
}: PoliceConfirmationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Emergency Services</Text>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable style={styles.confirmBtn} onPress={onConfirm}>
          <Text style={styles.confirmText}>Confirm</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 60,
    color: "#374151",
  },
  actions: {
    flexDirection: "row",
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginRight: 8,
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    marginLeft: 8,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "600",
    color: "#111827",
  },
  confirmText: {
    fontWeight: "700",
    color: "#fff",
  },
});
