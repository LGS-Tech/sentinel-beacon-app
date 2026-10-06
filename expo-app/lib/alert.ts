import { Alert, Platform, type AlertButton, type AlertOptions } from "react-native";

/**
 * Drop-in replacement for Alert.alert. react-native-web ships Alert.alert as a
 * no-op, so on web this falls back to window.alert / window.confirm.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions
): void {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons, options);
    return;
  }

  if (typeof window === "undefined") return;

  const text = [title, message].filter(Boolean).join("\n\n");
  const list = buttons ?? [];

  if (list.length <= 1) {
    window.alert(text);
    list[0]?.onPress?.();
    return;
  }

  if (list.length > 2) {
    console.warn(
      `showAlert: ${list.length} buttons are not supported on web; only cancel and the first non-cancel button are offered.`
    );
  }

  const cancelButton = list.find((button) => button.style === "cancel");
  const confirmButton = list.find((button) => button.style !== "cancel");

  // The confirm action only ever runs after an explicit OK.
  if (window.confirm(text)) {
    confirmButton?.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}
