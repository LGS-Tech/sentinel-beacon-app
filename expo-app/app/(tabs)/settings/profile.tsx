import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "expo-router";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  formatDateTime,
  formatUserType,
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
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [yearSemester, setYearSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [userType, setUserType] = useState("");
  const [accessLabel, setAccessLabel] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

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
      setDirty(false);
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
    setUsername(user.username ?? "");
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(getUserPhone(user));
    setRole(user.role ?? "");
    setCollegeId(user.collegeId ?? "");
    setYearSemester(user.yearSemester ?? "");
    setDepartment(user.department ?? "Unassigned");
    setUserType(formatUserType(user.userType));
    setAccessLabel(getAccessLevelLabel(user.authorisation));
    setLastLogin(formatDateTime(user.lastLoginAt));
    setAccountStatus(user.isActive === false ? "Inactive" : "Active");
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function markDirty() {
    setDirty(true);
  }

  async function onSave() {
    if (userId == null) {
      Alert.alert("Offline", "Connect to the backend API to save profile changes.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      Alert.alert("Missing details", "Name and email are required.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateUser(userId, {
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        collegeId: collegeId.trim() || null,
        yearSemester: yearSemester.trim() || null,
        "phone number": phone.trim(),
        phone: phone.trim(),
      });
      applyUser(updated);
      setDirty(false);
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
        Your account is stored in PostgreSQL. Editable fields sync when the API
        is online; organisation fields are shown for context.
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

      <View style={[settingsStyles.card, styles.summaryCard]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(name?.[0] ?? username?.[0] ?? "?").toUpperCase()}
          </Text>
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryName}>{name || "Staff member"}</Text>
          <Text style={settingsStyles.muted}>{email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgePrimary]}>
              <Text style={styles.badgeText}>{userType}</Text>
            </View>
            <View
              style={[
                styles.badge,
                accountStatus === "Active"
                  ? styles.badgeSuccess
                  : styles.badgeMuted,
              ]}
            >
              <Text style={styles.badgeText}>{accountStatus}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={settingsStyles.sectionTitle}>Account</Text>
      <Text style={settingsStyles.inputLabel}>Username</Text>
      <TextInput
        style={[settingsStyles.input, styles.readOnly]}
        value={username}
        editable={false}
      />

      <Text style={settingsStyles.inputLabel}>Full name</Text>
      <TextInput
        style={settingsStyles.input}
        value={name}
        onChangeText={(v) => {
          setName(v);
          markDirty();
        }}
        placeholder="Name"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Email</Text>
      <TextInput
        style={settingsStyles.input}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          markDirty();
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Phone</Text>
      <TextInput
        style={settingsStyles.input}
        value={phone}
        onChangeText={(v) => {
          setPhone(v);
          markDirty();
        }}
        keyboardType="phone-pad"
        placeholder="Phone"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Role title</Text>
      <TextInput
        style={settingsStyles.input}
        value={role}
        onChangeText={(v) => {
          setRole(v);
          markDirty();
        }}
        placeholder="e.g. Art teacher"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.sectionTitle}>Organisation</Text>
      <InfoRow label="Department" value={department} />
      <InfoRow label="College / site id" value={collegeId || "—"} />
      <InfoRow label="Year / semester" value={yearSemester || "—"} />
      <InfoRow label="Access level" value={accessLabel} />
      <InfoRow label="Last login" value={lastLogin} />

      <Text style={settingsStyles.inputLabel}>College / site id (editable)</Text>
      <TextInput
        style={settingsStyles.input}
        value={collegeId}
        onChangeText={(v) => {
          setCollegeId(v);
          markDirty();
        }}
        placeholder="Optional college identifier"
        placeholderTextColor="#999"
      />

      <Text style={settingsStyles.inputLabel}>Year / semester (editable)</Text>
      <TextInput
        style={settingsStyles.input}
        value={yearSemester}
        onChangeText={(v) => {
          setYearSemester(v);
          markDirty();
        }}
        placeholder="e.g. Year 12"
        placeholderTextColor="#999"
      />

      <Pressable
        style={[
          settingsStyles.primaryButton,
          (saving || !dirty) && { opacity: 0.7 },
        ]}
        onPress={onSave}
        disabled={saving || !dirty}
      >
        <Text style={settingsStyles.primaryButtonText}>
          {saving ? "Saving…" : dirty ? "Save profile" : "No changes"}
        </Text>
      </Pressable>

      <Pressable
        style={settingsStyles.secondaryButton}
        onPress={load}
        disabled={saving}
      >
        <Text style={settingsStyles.secondaryButtonText}>Discard & reload</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SettingsColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  summaryText: { flex: 1 },
  summaryName: {
    fontSize: 18,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 2,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePrimary: { backgroundColor: "#FEE2E2" },
  badgeSuccess: { backgroundColor: "#DCFCE7" },
  badgeMuted: { backgroundColor: "#F3F4F6" },
  badgeText: { fontSize: 11, fontWeight: "700", color: SettingsColors.text },
  readOnly: { backgroundColor: "#F3F4F6", color: SettingsColors.muted },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 12,
  },
  infoLabel: { fontSize: 13, color: SettingsColors.muted, flex: 1 },
  infoValue: {
    fontSize: 13,
    color: SettingsColors.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});
