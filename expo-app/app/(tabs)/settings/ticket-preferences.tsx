import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { SettingsToggleRow } from "@/components/settings-toggle-row";
import {
  SettingsColors,
  settingsStyles,
} from "@/constants/settings-theme";
import {
  getAccessLevelLabel,
  getCurrentUserId,
  getUser,
  hydrateSession,
} from "@/lib/api";
import {
  loadTicketPrefs,
  saveTicketPrefs,
  ticketCategories,
  type TicketCategory,
  type TicketPrefs,
  type TicketPriority,
} from "@/lib/ticket-prefs";

const priorities: { value: TicketPriority; label: string; detail: string }[] = [
  { value: "normal", label: "Normal", detail: "Standard queue processing" },
  { value: "high", label: "High", detail: "Escalated visibility for urgent issues" },
];

export default function TicketPreferencesScreen() {
  const [prefs, setPrefs] = useState<TicketPrefs | null>(null);
  const [accessNote, setAccessNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [loaded] = await Promise.all([loadTicketPrefs(), hydrateSession()]);
        let note = "";
        try {
          const user = await getUser(getCurrentUserId());
          if (user) {
            note = `${user.role} · ${getAccessLevelLabel(user.authorisation)}`;
            if (user.authorisation === 1 && !loaded.allowReopenClosed) {
              note += " — leads can enable vault reopen below";
            }
          }
        } catch {
          // offline
        }
        if (!active) return;
        setPrefs(loaded);
        setAccessNote(note);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  async function patch(partial: Partial<TicketPrefs>) {
    if (!prefs) return;
    const next = { ...prefs, ...partial };
    setPrefs(next);
    await saveTicketPrefs(next);
  }

  if (!prefs) {
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
    >
      <Text style={settingsStyles.title}>Ticket preferences</Text>
      <Text style={[settingsStyles.subtitle, { marginBottom: 8 }]}>
        Defaults for raising and updating tickets on the Dashboard map.
        Categories align with LGS v1: Facilities, IT Support, Engineering, and
        Injury.
      </Text>
      {accessNote ? (
        <Text style={[settingsStyles.muted, { marginBottom: 16 }]}>
          {accessNote}
        </Text>
      ) : (
        <View style={{ marginBottom: 16 }} />
      )}

      <Text style={settingsStyles.sectionTitle}>Default category</Text>
      <View style={[settingsStyles.card, { marginBottom: 20 }]}>
        {ticketCategories.map((category, index) => {
          const selected = prefs.defaultCategory === category;
          return (
            <Pressable
              key={category}
              style={[
                styles.chipRow,
                index === ticketCategories.length - 1 && settingsStyles.rowLast,
              ]}
              onPress={() =>
                patch({ defaultCategory: category as TicketCategory })
              }
            >
              <Text style={settingsStyles.label}>{category}</Text>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={settingsStyles.sectionTitle}>Default priority</Text>
      <View style={[settingsStyles.card, { marginBottom: 20 }]}>
        {priorities.map((priority, index) => {
          const selected = prefs.defaultPriority === priority.value;
          return (
            <Pressable
              key={priority.value}
              style={[
                styles.chipRow,
                index === priorities.length - 1 && settingsStyles.rowLast,
              ]}
              onPress={() => patch({ defaultPriority: priority.value })}
            >
              <View style={{ flex: 1 }}>
                <Text style={settingsStyles.label}>{priority.label}</Text>
                <Text style={settingsStyles.muted}>{priority.detail}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={settingsStyles.sectionTitle}>Raise & update flow</Text>
      <View style={settingsStyles.card}>
        <SettingsToggleRow
          label="Pin on map when raising"
          description="Place a map marker so tickets stay location-traceable"
          value={prefs.pinOnMapWhenRaising}
          onChange={(v) => patch({ pinOnMapWhenRaising: v })}
        />
        <SettingsToggleRow
          label="Quick update from map"
          description="Tap a map icon to jump straight into that ticket"
          value={prefs.quickUpdateFromMap}
          onChange={(v) => patch({ quickUpdateFromMap: v })}
        />
        <SettingsToggleRow
          label="Confirm before submit"
          description="Show a confirmation step when raising a ticket"
          value={prefs.confirmBeforeSubmit}
          onChange={(v) => patch({ confirmBeforeSubmit: v })}
        />
        <SettingsToggleRow
          label="Show hidden cost field"
          description="Optional cost impact on tickets (when quantified)"
          value={prefs.showHiddenCostField}
          onChange={(v) => patch({ showHiddenCostField: v })}
        />
        <SettingsToggleRow
          label="Allow reopen closed tickets"
          description="Vault can reopen closed cases for follow-up"
          value={prefs.allowReopenClosed}
          onChange={(v) => patch({ allowReopenClosed: v })}
          last
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  radioSelected: {
    borderColor: SettingsColors.primary,
    backgroundColor: SettingsColors.primary,
  },
});
