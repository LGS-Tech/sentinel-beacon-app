import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  getCurrentUserId,
  getUser,
  hydrateSession,
  loginWithEmailPassword,
  updateUser,
} from "@/lib/api";

type Strength = "weak" | "fair" | "good" | "strong";

function scorePassword(value: string): Strength {
  if (value.length < 6) return "weak";
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (score <= 1) return "fair";
  if (score <= 3) return "good";
  return "strong";
}

const strengthColors: Record<Strength, string> = {
  weak: "#DC2626",
  fair: "#CA8A04",
  good: "#2563EB",
  strong: "#16A34A",
};

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = scorePassword(nextPassword);

  async function onSave() {
    if (!currentPassword) {
      Alert.alert("Missing password", "Enter your current password.");
      return;
    }
    if (!nextPassword.trim() || nextPassword.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    if (nextPassword === currentPassword) {
      Alert.alert("Same password", "Choose a different password from your current one.");
      return;
    }
    if (nextPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await hydrateSession();
      const id = getCurrentUserId();
      const user = await getUser(id);
      if (!user) {
        Alert.alert("Offline", "Could not load your account from the API.");
        return;
      }
      if (!user.email) {
        Alert.alert("Error", "Account email is missing.");
        return;
      }

      try {
        await loginWithEmailPassword(user.email, currentPassword);
      } catch {
        Alert.alert("Incorrect", "Current password is wrong.");
        return;
      }

      await updateUser(id, { password: nextPassword });
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      Alert.alert("Updated", "Password saved to the PostgreSQL API.");
    } catch (e) {
      Alert.alert(
        "Failed",
        e instanceof Error ? e.message : "Could not update password."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={settingsStyles.title}>Change Password</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Passwords are bcrypt-hashed in PostgreSQL. We verify your current
        password before saving a new one.
      </Text>

      <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
        <Text style={styles.tipTitle}>Password requirements</Text>
        <Text style={styles.tipLine}>• Minimum 6 characters (8+ recommended)</Text>
        <Text style={styles.tipLine}>• Mix letters, numbers, and symbols for stronger security</Text>
        <Text style={styles.tipLine}>• Do not reuse your campus email password elsewhere</Text>
      </View>

      <Text style={settingsStyles.inputLabel}>Current password</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[settingsStyles.input, styles.inputFlex]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrent}
          placeholder="Current password"
          placeholderTextColor="#999"
        />
        <Pressable style={styles.eye} onPress={() => setShowCurrent((v) => !v)}>
          <MaterialIcons
            name={showCurrent ? "visibility-off" : "visibility"}
            size={22}
            color={SettingsColors.muted}
          />
        </Pressable>
      </View>

      <Text style={settingsStyles.inputLabel}>New password</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[settingsStyles.input, styles.inputFlex]}
          value={nextPassword}
          onChangeText={setNextPassword}
          secureTextEntry={!showNext}
          placeholder="New password"
          placeholderTextColor="#999"
        />
        <Pressable style={styles.eye} onPress={() => setShowNext((v) => !v)}>
          <MaterialIcons
            name={showNext ? "visibility-off" : "visibility"}
            size={22}
            color={SettingsColors.muted}
          />
        </Pressable>
      </View>

      {nextPassword.length > 0 ? (
        <View style={styles.strengthBlock}>
          <View style={styles.strengthBarTrack}>
            <View
              style={[
                styles.strengthBarFill,
                {
                  width:
                    strength === "weak"
                      ? "25%"
                      : strength === "fair"
                        ? "50%"
                        : strength === "good"
                          ? "75%"
                          : "100%",
                  backgroundColor: strengthColors[strength],
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
            Strength: {strength}
          </Text>
        </View>
      ) : null}

      <Text style={settingsStyles.inputLabel}>Confirm new password</Text>
      <TextInput
        style={settingsStyles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showNext}
        placeholder="Confirm password"
        placeholderTextColor="#999"
      />

      <Pressable
        style={[settingsStyles.primaryButton, saving && { opacity: 0.7 }]}
        onPress={onSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={settingsStyles.primaryButtonText}>Update password</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 6,
  },
  tipLine: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  inputFlex: { flex: 1, marginBottom: 0 },
  eye: {
    marginLeft: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: SettingsColors.border,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  strengthBlock: { marginBottom: 12 },
  strengthBarTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  strengthBarFill: { height: 6, borderRadius: 999 },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
});
