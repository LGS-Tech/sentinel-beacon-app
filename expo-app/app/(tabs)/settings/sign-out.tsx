import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { settingsStyles } from "@/constants/settings-theme";
import { clearSession } from "@/lib/api";

export default function SignOutScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onConfirm() {
    setBusy(true);
    try {
      await clearSession();
      router.replace("/login-page");
    } catch (e) {
      Alert.alert(
        "Sign out failed",
        e instanceof Error ? e.message : "Could not clear session."
      );
      setBusy(false);
    }
  }

  return (
    <View style={[settingsStyles.screen, settingsStyles.content]}>
      <Text style={settingsStyles.title}>Sign Out</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 8 }]}>
        Are you sure you want to log out of your profile?
      </Text>
      <Text style={[settingsStyles.muted, { marginBottom: 16 }]}>
        You will need to sign in again with your email and password against the
        Express user directory.
      </Text>

      <Pressable
        style={[settingsStyles.primaryButton, busy && { opacity: 0.7 }]}
        onPress={onConfirm}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={settingsStyles.primaryButtonText}>Sign out</Text>
        )}
      </Pressable>

      <Pressable
        style={settingsStyles.secondaryButton}
        onPress={() => router.back()}
        disabled={busy}
      >
        <Text style={settingsStyles.secondaryButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}
