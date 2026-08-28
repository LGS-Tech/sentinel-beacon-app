import { getAuthHeaders } from "./api";

const API = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

async function requestJson(path: string, init?: RequestInit) {
  const authHeaders = await getAuthHeaders();
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
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

export async function getCases() {
  const data = await requestJson("/cases");
  return (data as any[]).map((c: any) => ({
    ...c,
    id: c._id ?? c.id,
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
