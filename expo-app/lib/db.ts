import { getAuthToken } from "./api";
import type { PickedVaultFile } from "./pickVaultFile";
import { Platform } from "react-native";

const API =
  (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

async function requestJson(path: string, init?: RequestInit) {
  let response: Response;
  try {
    const token = await getAuthToken();

    response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot reach API at ${API}${path}. Is backend/new running? (${
        error instanceof Error ? error.message : "Failed to fetch"
      })`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `API ${path} failed (${response.status})${text ? `: ${text}` : ""}`
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

export type CaseAttachment = {
  id: string;
  caseId: string;
  filename: string;
  mimeType: string | null;
  storageUrl: string;
  storageProvider: string;
  fileSizeBytes: number | null;
  uploadedByUserId: number | null;
  uploadedByName: string | null;
  createdAt: number | null;
};

export async function getCaseAttachments(
  caseId: string
): Promise<CaseAttachment[]> {
  const data = await requestJson(`/cases/${caseId}/attachments`);
  return Array.isArray(data) ? data : [];
}

export async function uploadCaseAttachment(
  caseId: string,
  file: PickedVaultFile
): Promise<CaseAttachment> {
  const token = await getAuthToken();
  const form = new FormData();
  if (Platform.OS !== "web" && file.uri) {
    form.append(
      "file",
      {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob
    );
  } else {
    form.append("file", file.blob, file.name);
  }

  let response: Response;
  try {
    response = await fetch(`${API}/cases/${caseId}/attachments`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
  } catch (error) {
    throw new Error(
      `Cannot reach API at ${API}/cases/${caseId}/attachments. (${
        error instanceof Error ? error.message : "Failed to fetch"
      })`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = `Upload failed (${response.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.json();
}

export async function fetchAttachmentBlob(
  caseId: string,
  attachmentId: string
): Promise<Blob> {
  const token = await getAuthToken();
  let response: Response;
  try {
    response = await fetch(
      `${API}/cases/${caseId}/attachments/${attachmentId}/content`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
  } catch (error) {
    throw new Error(
      `Cannot open the file. (${
        error instanceof Error ? error.message : "Failed to fetch"
      })`
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = `Unable to open file (${response.status})`;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  return response.blob();
}

export async function getCases() {
  const data = await requestJson("/cases");
  return (data as any[]).map((c: any) => ({
    ...c,
    id: c._id,
  }));
}

export async function createCase(data: any) {
  return requestJson("/cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateCase(id: string, data: any) {
  return requestJson(`/cases/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteCase(id: string) {
  await requestJson(`/cases/${id}`, {
    method: "DELETE",
  });
}
