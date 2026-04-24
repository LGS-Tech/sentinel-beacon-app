import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

type Props = {
  onClose: () => void
}

export default function CaseClosedSheet({ onClose }: Props) {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Case Closed</Text>

      <Text style={styles.text}>
        This case has now been closed.
      </Text>

      <Text style={styles.subText}>
        You can view all details and files in the Vault tab.
      </Text>

      <Pressable style={styles.btn} onPress={onClose}>
        <Text style={styles.btnText}>Done</Text>
      </Pressable>

    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  text: {
    fontSize: 15,
    marginBottom: 6,
    color: "#333",
  },

  subText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },

  btn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

})
