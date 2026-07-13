import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/LGS-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.appTitle}>LGS Tech</Text>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="University Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Remember + Forgot */}
      <View style={styles.optionsRow}>
        <Pressable
          style={styles.rememberContainer}
          onPress={() => setRemember(!remember)}
        >
          <View style={[styles.checkbox, remember && styles.checkboxChecked]} />
          <Text style={styles.rememberText}>Remember Me</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </Pressable>
      </View>

      {/* Login */}
      <Pressable style={styles.loginButton}>
        <Text style={styles.loginText}>Login</Text>
      </Pressable>

      {/* Create Account */}
      <Pressable
        style={styles.createButton}
        onPress={() => router.push("/registerPage")}
      >
        <Text style={styles.createText}>Create Account</Text>
      </Pressable>

      {/* Version */}
      <Text style={styles.version}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 25,
    justifyContent: "center",
  },

  logo: {
    width: 90,
    height: 90,
    alignSelf: "center",
    marginBottom: 15,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#D71920",
    textAlign: "center",
    marginBottom: 35,
  },

  input: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 15,
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#888",
    marginRight: 8,
    borderRadius: 3,
  },

  checkboxChecked: {
    backgroundColor: "#D71920",
    borderColor: "#D71920",
  },

  rememberText: {
    fontSize: 14,
    color: "#333",
  },

  forgotText: {
    color: "#C62828",
    fontWeight: "500",
  },

  loginButton: {
    backgroundColor: "#D71920",
    height: 55,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },

  createButton: {
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
  },

  createText: {
    color: "#222",
    fontSize: 17,
    fontWeight: "600",
  },

  version: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 12,
  },
});
