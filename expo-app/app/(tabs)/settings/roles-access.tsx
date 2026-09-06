import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  getAccessLevelLabel,
  getAccessResponsibilities,
  getCurrentUserId,
  getRoleComparison,
  getUser,
  hydrateSession,
  type User,
} from "@/lib/api";

export default function RolesAccessScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await hydrateSession();
      const loaded = await getUser(getCurrentUserId());
      setUser(loaded);
      if (!loaded) setError("User not found on the API.");
    } catch (e) {
      setUser(null);
      setError(
        e instanceof Error
          ? e.message
          : "Could not load access. Is the backend API running?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return (
      <View style={[settingsStyles.screen, { justifyContent: "center" }]}>
        <ActivityIndicator color={SettingsColors.primary} size="large" />
      </View>
    );
  }

  const responsibilities = getAccessResponsibilities(user?.authorisation);
  const comparison = getRoleComparison();
  const isLead = user?.authorisation === 1;

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Roles & Access</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        Authorisation levels control ticket priority, analytics visibility, and
        vault actions on the LGS platform.
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

      <View style={[settingsStyles.card, { padding: 14, marginBottom: 16 }]}>
        <Text style={styles.metaLabel}>Signed-in role</Text>
        <Text style={styles.metaValue}>{user?.role ?? "—"}</Text>
        <Text style={[styles.metaLabel, { marginTop: 12 }]}>Access level</Text>
        <Text style={styles.metaValue}>
          {getAccessLevelLabel(user?.authorisation)}
          {user?.authorisation != null
            ? ` · authorisation ${user.authorisation}`
            : ""}
        </Text>
        <Text style={[styles.metaLabel, { marginTop: 12 }]}>Account</Text>
        <Text style={styles.metaValue}>
          {user?.name ?? "—"} · {user?.email ?? "—"}
        </Text>
        {user?.department ? (
          <>
            <Text style={[styles.metaLabel, { marginTop: 12 }]}>Department</Text>
            <Text style={styles.metaValue}>{user.department}</Text>
          </>
        ) : null}
      </View>

      <View
        style={[
          styles.callout,
          isLead ? styles.calloutLead : styles.calloutStandard,
        ]}
      >
        <Text style={styles.calloutTitle}>
          {isLead ? "Lead access active" : "Standard access active"}
        </Text>
        <Text style={styles.calloutBody}>
          {isLead
            ? "You can manage cross-department tickets, analytics insights, and vault reopen actions."
            : "You can raise and update tickets for your site. Enable reopen in Ticket preferences if your lead allows it."}
        </Text>
      </View>

      <Text style={settingsStyles.sectionTitle}>Your responsibilities</Text>
      <View style={[settingsStyles.card, { marginBottom: 20 }]}>
        {responsibilities.map((item, index) => (
          <View
            key={item}
            style={[
              styles.row,
              index === responsibilities.length - 1 && settingsStyles.rowLast,
            ]}
          >
            <View style={styles.bullet} />
            <Text style={[settingsStyles.label, { flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={settingsStyles.sectionTitle}>Access level comparison</Text>
      {comparison.map((tier) => {
        const active = user?.authorisation === tier.authorisation;
        return (
          <View
            key={tier.authorisation}
            style={[
              settingsStyles.card,
              styles.tierCard,
              active && styles.tierCardActive,
            ]}
          >
            <Text style={styles.tierTitle}>
              {tier.level}
              {active ? " (you)" : ""}
            </Text>
            {tier.highlights.map((line) => (
              <Text key={line} style={styles.tierLine}>
                • {line}
              </Text>
            ))}
          </View>
        );
      })}

      <Pressable
        style={settingsStyles.primaryButton}
        onPress={() => router.push("/settings/ticket-preferences")}
      >
        <Text style={settingsStyles.primaryButtonText}>
          Open ticket preferences
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  metaLabel: {
    fontSize: 12,
    color: SettingsColors.muted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 16,
    color: SettingsColors.text,
    fontWeight: "600",
    marginTop: 4,
  },
  callout: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  calloutLead: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  calloutStandard: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 4,
  },
  calloutBody: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 19,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: SettingsColors.primary,
    marginTop: 6,
  },
  tierCard: {
    padding: 14,
    marginBottom: 12,
  },
  tierCardActive: {
    borderColor: SettingsColors.primary,
    borderWidth: 2,
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 8,
  },
  tierLine: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 20,
    marginBottom: 2,
  },
});
