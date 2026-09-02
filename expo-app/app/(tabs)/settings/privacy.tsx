import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";

const sections = [
  {
    title: "Data we collect",
    body:
      "Account details (name, email, role), ticket metadata (location, category, status), and optional attachment URLs. Passwords are stored as bcrypt hashes in PostgreSQL — never in plain text.",
  },
  {
    title: "How data is used",
    body:
      "To operate the campus ticketing workflow: assignment, analytics, vault history, and maintainer coordination. Demo deployments may use seeded staff accounts for testing.",
  },
  {
    title: "Storage & retention",
    body:
      "Primary storage is PostgreSQL (Render or local Docker). Device preferences (notifications, theme, ticket defaults) stay in AsyncStorage on your phone or browser.",
  },
  {
    title: "Sharing",
    body:
      "Ticket data is visible to authorised staff on your site. We do not sell personal data. Third-party integrations (e.g. Flask alerts) only receive data you explicitly route to them.",
  },
  {
    title: "Your rights",
    body:
      "You can update profile details in Settings → Profile, change your password, and sign out to clear the local session token. Contact your site administrator to deactivate an account.",
  },
  {
    title: "Security",
    body:
      "API access uses JWT bearer tokens over HTTPS in production. Use a strong password and sign out on shared devices.",
  },
];

export default function PrivacyScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ScrollView
      style={settingsStyles.screen}
      contentContainerStyle={settingsStyles.content}
    >
      <Text style={settingsStyles.title}>Privacy Policy</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 16 }]}>
        LGS Tech Sentinel Beacon — summary for staff and students using the
        ticketing platform. Last updated September 2026.
      </Text>

      <View style={[settingsStyles.card, styles.summaryCard]}>
        <Text style={styles.summaryTitle}>Plain-language summary</Text>
        <Text style={styles.summaryBody}>
          We store what you need to raise and manage tickets securely. You
          control device preferences locally; account data lives in PostgreSQL
          and is only shared with authorised campus staff.
        </Text>
      </View>

      {sections.map((section, index) => {
        const open = openIndex === index;
        return (
          <Pressable
            key={section.title}
            style={[settingsStyles.card, styles.sectionCard]}
            onPress={() => setOpenIndex(open ? null : index)}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.chevron}>{open ? "−" : "+"}</Text>
            </View>
            {open ? <Text style={styles.sectionBody}>{section.body}</Text> : null}
          </Pressable>
        );
      })}

      <Text style={[settingsStyles.muted, { marginTop: 16, lineHeight: 20 }]}>
        Questions? Contact your LGS Tech site administrator or the development
        team via the project repository.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 6,
  },
  summaryBody: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 20,
  },
  sectionCard: {
    padding: 14,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: SettingsColors.text,
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: SettingsColors.muted,
    marginLeft: 8,
  },
  sectionBody: {
    fontSize: 13,
    color: SettingsColors.muted,
    lineHeight: 20,
    marginTop: 10,
  },
});
