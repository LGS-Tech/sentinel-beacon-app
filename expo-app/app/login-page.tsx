import React, { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Name</Text>
        <Text style={styles.subtitle}>Fire & Intrusion Detection System</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#9CA3AF"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>Secure access only</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    padding: 20,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 1,
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#374151",
  },

  button: {
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  forgot: {
    color: "#FCA5A5",
    textAlign: "center",
    marginTop: 15,
  },

  footer: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
    fontSize: 12,
  },
});
