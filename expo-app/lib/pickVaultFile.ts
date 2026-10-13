import { Platform } from "react-native";

const ACCEPT =
  "text/plain,application/pdf,image/jpeg,image/png,.txt,.pdf,.jpg,.jpeg,.png";

function guessMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "text/plain";
}

export type PickedVaultFile = {
  name: string;
  mimeType: string;
  blob: Blob;
  uri?: string;
};

export async function pickVaultFile(): Promise<PickedVaultFile | null> {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ACCEPT;
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        resolve({
          name: file.name,
          mimeType: file.type || guessMime(file.name),
          blob: file,
        });
      };
      input.click();
    });
  }

  const DocumentPicker = await import("expo-document-picker");
  const result = await DocumentPicker.getDocumentAsync({
    type: ["text/plain", "application/pdf", "image/jpeg", "image/png"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  return {
    name: asset.name || "file",
    mimeType: asset.mimeType || blob.type || guessMime(asset.name || ""),
    blob,
    uri: asset.uri,
  };
}
