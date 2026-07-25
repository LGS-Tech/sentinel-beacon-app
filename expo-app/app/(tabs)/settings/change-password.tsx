import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  settingsStyles,
} from "@/constants/settings-theme";
import {
  getCurrentUserId,
  getUser,
  hydrateSession,
  updateUser,
} from "@/lib/api";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSave() {
    if (!nextPassword.trim() || nextPassword.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
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
        Alert.alert("Offline", "Could not load your account from Express.");
        return;
      }
      if ((user.password ?? "") !== currentPassword) {
        Alert.alert("Incorrect", "Current password is wrong.");
        return;
      }
      await updateUser(id, { password: nextPassword });
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      Alert.alert("Updated", "Password saved to the Express API.");
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
        Update your credentials to keep your account secure. Changes sync to
        Express when the server is running.
      </Text>

      <Text style={settingsStyles.inputLabel}>Current password</Text>
      <TextInput
        style={settingsStyles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        placeholder="Current password"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>New password</Text>
      <TextInput
        style={settingsStyles.input}
        value={nextPassword}
        onChangeText={setNextPassword}
        secureTextEntry
        placeholder="New password"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Confirm new password</Text>
      <TextInput
        style={settingsStyles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
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
