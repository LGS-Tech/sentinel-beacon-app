import { Platform } from "react-native";

const PDF_MIME = "application/pdf";

function isPdf(name: string, mimeType: string): boolean {
  return (
    name.toLowerCase().endsWith(".pdf") ||
    mimeType === PDF_MIME ||
    mimeType === "application/x-pdf"
  );
}

export type PickedVaultFile = {
  name: string;
  mimeType: string;
  blob: Blob;
  uri?: string;
};

export async function pickVaultFile(): Promise<PickedVaultFile | null> {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,application/pdf";
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve(null);
          return;
        }
        const mimeType = file.type || PDF_MIME;
        if (!isPdf(file.name, mimeType)) {
          reject(new Error("Only PDF files can be uploaded."));
          return;
        }
        resolve({
          name: file.name,
          mimeType: mimeType === "application/x-pdf" ? PDF_MIME : mimeType || PDF_MIME,
          blob: file,
        });
      };
      input.click();
    });
  }

  const DocumentPicker = await import("expo-document-picker");
  const result = await DocumentPicker.getDocumentAsync({
    type: [PDF_MIME],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  const name = asset.name || "file.pdf";
  const mimeType = asset.mimeType || PDF_MIME;
  if (!isPdf(name, mimeType)) {
    throw new Error("Only PDF files can be uploaded.");
  }
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  return {
    name,
    mimeType: mimeType === "application/x-pdf" ? PDF_MIME : mimeType,
    blob,
    uri: asset.uri,
  };
}
