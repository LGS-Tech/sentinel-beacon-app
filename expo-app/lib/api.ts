import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export type User = {
  id: number;
  username: string;
  password?: string;
  email: string;
  name: string;
  role: string;
  authorisation?: number;
  /** Express JSON uses a spaced key for some seed rows */
  "phone number"?: string;
  phone?: string;
};

export type HealthStatus = {
  ok: boolean;
  message: string;
};

/** authorisation 1 = site lead / higher priority; 2 = standard staff */
export function getAccessLevelLabel(authorisation?: number): string {
  if (authorisation === 1) return "Priority / Lead";
  if (authorisation === 2) return "Standard staff";
  return "Unassigned";
}

export function getAccessResponsibilities(authorisation?: number): string[] {
  if (authorisation === 1) {
    return [
      "Raise and reassign tickets across categories",
      "View Analytics cost and dwell insights",
      "Reopen closed cases in Vault",
      "Higher priority status on active tickets",
    ];
  }
  if (authorisation === 2) {
    return [
      "Raise and update tickets for your site",
      "View Dashboard map and active cases",
      "Access Vault for case history",
      "Manage own profile and notification prefs",
    ];
  }
  return ["Sign in to load role-based access from the Express API."];
}

const SESSION_KEY = "sentinel.currentUserId";
const TOKEN_KEY = "sentinel.authToken";
const DEFAULT_EXPRESS = "http://localhost:3000";
const DEFAULT_FLASK = "http://localhost:5000";

function resolveUrl(envKey: string, fallback: string): string {
  const fromEnv = process.env[envKey];
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");

  const extra = Constants.expoConfig?.extra as
    | Record<string, string>
    | undefined;
  const fromExtra = extra?.[envKey];
  if (fromExtra && fromExtra.trim()) return fromExtra.replace(/\/$/, "");

  return fallback;
}

export const EXPRESS_URL = resolveUrl("EXPO_PUBLIC_API_URL", DEFAULT_EXPRESS);
export const FLASK_URL = resolveUrl("EXPO_PUBLIC_FLASK_URL", DEFAULT_FLASK);

let currentUserId = 1;
let authToken: string | null = null;
let sessionHydrated = false;

export function getCurrentUserId(): number {
  return currentUserId;
}

export function setCurrentUserId(id: number): void {
  currentUserId = id;
}

export async function hydrateSession(): Promise<number> {
  if (sessionHydrated) return currentUserId;

  try {
    const [rawUserId, storedToken] = await Promise.all([
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ]);

    if (rawUserId) {
      const parsed = Number(rawUserId);
      if (!Number.isNaN(parsed) && parsed > 0) currentUserId = parsed;
    }

    authToken = storedToken;
  } catch {
    // keep defaults
  }

  sessionHydrated = true;
  return currentUserId;
}

export async function persistSession(
  id: number,
  token?: string
): Promise<void> {
  currentUserId = id;
  sessionHydrated = true;

  await AsyncStorage.setItem(SESSION_KEY, String(id));

  if (token) {
    authToken = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
}

export async function clearSession(): Promise<void> {
  currentUserId = 1;
  authToken = null;
  sessionHydrated = true;

  await Promise.all([
    AsyncStorage.removeItem(SESSION_KEY),
    AsyncStorage.removeItem(TOKEN_KEY),
  ]);
}

export async function getAuthToken(): Promise<string | null> {
  if (authToken) return authToken;

  try {
    authToken = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    authToken = null;
  }

  return authToken;
}

async function request<T>(
  base: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const token = await getAuthToken();

    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Request failed (${res.status})`);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getUsers(): Promise<User[]> {
  return request<User[]>(EXPRESS_URL, "/users");
}

export async function getUser(id: number): Promise<User | null> {
  try {
    return await request<User>(EXPRESS_URL, `/users/${id}`);
  } catch {
    return null;
  }
}

export async function updateUser(
  id: number,
  body: Partial<User>
): Promise<User> {
  return request<User>(EXPRESS_URL, `/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function createUser(
  body: Omit<User, "id"> & { id?: number }
): Promise<User> {
  return request<User>(EXPRESS_URL, "/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getUserPhone(user: User): string {
  return user.phone ?? user["phone number"] ?? "";
}

type LoginResponse = {
  token: string;
  user: User;
};

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<User> {
  const result = await request<LoginResponse>(EXPRESS_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  if (!result?.token || !result?.user?.id) {
    throw new Error("Invalid login response from API.");
  }

  await persistSession(result.user.id, result.token);
  return result.user;
}

export async function checkExpressHealth(): Promise<HealthStatus> {
  try {
    await request<unknown>(EXPRESS_URL, "/health");
    return { ok: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach API";
    return { ok: false, message };
  }
}

export async function checkUsersHealth(): Promise<HealthStatus> {
  try {
    await getUsers();
    return { ok: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach users API";
    return { ok: false, message };
  }
}

export async function checkFlaskHealth(): Promise<HealthStatus> {
  try {
    await request<unknown>(FLASK_URL, "/api/v1/intruder/path");
    return { ok: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach Flask API";
    return { ok: false, message };
  }
}
