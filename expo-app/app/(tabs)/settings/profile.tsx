import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  getAccessLevelLabel,
  getCurrentUserId,
  getUser,
  getUserPhone,
  hydrateSession,
  updateUser,
  type User,
} from "@/lib/api";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [accessLabel, setAccessLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await hydrateSession();
      const id = getCurrentUserId();
      const user = await getUser(id);
      if (!user) {
        setError("User not found on the API.");
        setUserId(null);
        return;
      }
      applyUser(user);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load profile. Is the backend API running?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function applyUser(user: User) {
    setUserId(user.id);
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(getUserPhone(user));
    setRole(user.role ?? "");
    setAccessLabel(getAccessLevelLabel(user.authorisation));
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onSave() {
    if (userId == null) {
      Alert.alert("Offline", "Connect to the backend API to save profile changes.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUser(userId, {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        "phone number": phone.trim(),
        phone: phone.trim(),
      });
      applyUser(updated);
      Alert.alert("Saved", "Profile updated on the PostgreSQL API.");
    } catch (e) {
      Alert.alert(
        "Save failed",
        e instanceof Error ? e.message : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={[settingsStyles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={settingsStyles.title}>Profile</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Manage your personal account details. Changes sync to the PostgreSQL
        backend when it is online.
      </Text>

      {error ? (
        <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
          <Text style={{ color: SettingsColors.primary, marginBottom: 8 }}>
            {error}
          </Text>
          <Pressable style={settingsStyles.secondaryButton} onPress={load}>
            <Text style={settingsStyles.secondaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={settingsStyles.inputLabel}>Full name</Text>
      <TextInput
        style={settingsStyles.input}
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Email</Text>
      <TextInput
        style={settingsStyles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Phone</Text>
      <TextInput
        style={settingsStyles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Phone"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Role</Text>
      <TextInput
        style={settingsStyles.input}
        value={role}
        onChangeText={setRole}
        placeholder="Role"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Access level</Text>
      <TextInput
        style={[settingsStyles.input, { backgroundColor: "#F3F4F6" }]}
        value={accessLabel}
        editable={false}
        placeholder="Access level"
        placeholderTextColor="#999"
      />

      <Pressable
        style={[
          settingsStyles.primaryButton,
          saving && { opacity: 0.7 },
        ]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={settingsStyles.primaryButtonText}>
          {saving ? "Saving…" : "Save profile"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
