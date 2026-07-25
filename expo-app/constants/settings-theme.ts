import { StyleSheet } from "react-native";

export const SettingsColors = {
  background: "#F8F8F8",
  card: "#FFFFFF",
  border: "#EEEEEE",
  text: "#222222",
  muted: "#666666",
  primary: "#DC2626",
  success: "#16A34A",
  warning: "#CA8A04",
  offline: "#9CA3AF",
  headerBg: "#F3F4F6",
};

export const settingsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SettingsColors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: SettingsColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SettingsColors.border,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    color: SettingsColors.muted,
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
    backgroundColor: SettingsColors.card,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 15,
    color: SettingsColors.text,
  },
  muted: {
    fontSize: 13,
    color: SettingsColors.muted,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: SettingsColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: SettingsColors.muted,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: SettingsColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: SettingsColors.primary,
  },
  secondaryButtonText: {
    color: SettingsColors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: SettingsColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: SettingsColors.text,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: SettingsColors.muted,
    marginBottom: 6,
    marginLeft: 2,
    fontWeight: "600",
  },
});
