import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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
  hydrateSession,
} from "@/lib/api";
import {
  loadTicketPrefs,
  saveTicketPrefs,
  ticketCategories,
  type TicketCategory,
  type TicketPrefs,
} from "@/lib/ticket-prefs";

export default function TicketPreferencesScreen() {
  const [prefs, setPrefs] = useState<TicketPrefs | null>(null);
  const [accessNote, setAccessNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [loaded, _] = await Promise.all([
          loadTicketPrefs(),
          hydrateSession(),
        ]);
        let note = "";
        try {
          const user = await getUser(getCurrentUserId());
          if (user) {
            note = `${user.role} · ${getAccessLevelLabel(user.authorisation)}`;
            // Lead accounts default reopen capability on first load if unset in storage sense —
            // we still respect stored prefs; only surface guidance.
            if (user.authorisation === 1 && !loaded.allowReopenClosed) {
              note += " — leads can enable reopen closed tickets below";
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
        Defaults for raising and updating tickets on the map dashboard. Matches
        v1 categories: Facilities, IT Support, Engineering (+ Injury).
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
              <View
                style={[
                  styles.radio,
                  selected && styles.radioSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={settingsStyles.sectionTitle}>Raise & update flow</Text>
      <View style={settingsStyles.card}>
        <ToggleRow
          label="Pin on map when raising"
          description="Place a map marker so tickets stay location-traceable"
          value={prefs.pinOnMapWhenRaising}
          onChange={(v) => patch({ pinOnMapWhenRaising: v })}
        />
        <ToggleRow
          label="Quick update from map"
          description="Tap a map icon to jump straight into that ticket"
          value={prefs.quickUpdateFromMap}
          onChange={(v) => patch({ quickUpdateFromMap: v })}
        />
        <ToggleRow
          label="Show hidden cost field"
          description="Optional cost impact on tickets (when quantified)"
          value={prefs.showHiddenCostField}
          onChange={(v) => patch({ showHiddenCostField: v })}
        />
        <ToggleRow
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

function ToggleRow({
  label,
  description,
  value,
  onChange,
  last,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, last && settingsStyles.rowLast]}>
      <View style={styles.textBlock}>
        <Text style={settingsStyles.label}>{label}</Text>
        <Text style={settingsStyles.muted}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
        thumbColor={value ? SettingsColors.primary : "#f4f4f5"}
      />
    </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    gap: 12,
  },
  textBlock: { flex: 1, paddingRight: 8 },
});
