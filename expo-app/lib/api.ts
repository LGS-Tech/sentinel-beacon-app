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
  collegeId?: string | null;
  departmentId?: number | null;
  department?: string | null;
  yearSemester?: string | null;
  userType?: string | null;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** Legacy seed rows may use a spaced phone key */
  "phone number"?: string;
  phone?: string;
};

export type HealthStatus = {
  ok: boolean;
  message: string;
};

export type AnalyticsSummary = {
  active: number;
  closed: number;
  total: number;
  avgDurationMs: number;
  byCategory: { category: string; count: number }[];
  hotspots: { label: string; count: number }[];
  servicesContacted: {
    police: number;
    fire: number;
    ambulance: number;
    maintenance: number;
  };
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
  return ["Sign in to load role-based access from the PostgreSQL API."];
}

const SESSION_KEY = "sentinel.currentUserId";
const TOKEN_KEY = "sentinel.authToken";
const DEFAULT_API_URL = "http://localhost:3000";
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

export const API_URL = resolveUrl("EXPO_PUBLIC_API_URL", DEFAULT_API_URL);
export const FLASK_URL = resolveUrl("EXPO_PUBLIC_FLASK_URL", DEFAULT_FLASK);

/** @deprecated Use API_URL */
export const EXPRESS_URL = API_URL;

let currentUserId = 1;
let authToken: string | null = null;
let sessionHydrated = false;

export function getCurrentUserId(): number {
  return currentUserId;
}

export function setCurrentUserId(id: number): void {
  currentUserId = id;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  await hydrateSession();
  if (!authToken) return {};
  return { Authorization: `Bearer ${authToken}` };
}

export async function hydrateSession(): Promise<number> {
  if (sessionHydrated) return currentUserId;
  try {
    const [rawId, rawToken] = await Promise.all([
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ]);
    if (rawId) {
      const parsed = Number(rawId);
      if (!Number.isNaN(parsed) && parsed > 0) currentUserId = parsed;
    }
    if (rawToken) authToken = rawToken;
  } catch {
    // keep defaults
  }
  sessionHydrated = true;
  return currentUserId;
}

export async function persistSession(id: number, token?: string): Promise<void> {
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
  await AsyncStorage.multiRemove([SESSION_KEY, TOKEN_KEY]);
}

async function request<T>(
  base: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const authHeaders = await getAuthHeaders();

  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
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
  return request<User[]>(API_URL, "/users");
}

export async function getUser(id: number): Promise<User | null> {
  try {
    return await request<User>(API_URL, `/users/${id}`);
  } catch {
    return null;
  }
}

export async function updateUser(
  id: number,
  body: Partial<User>
): Promise<User> {
  return request<User>(API_URL, `/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function createUser(
  body: Omit<User, "id"> & { id?: number }
): Promise<User> {
  return request<User>(API_URL, "/users", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getUserPhone(user: User): string {
  return user.phone ?? user["phone number"] ?? "";
}

export function formatUserType(userType?: string | null): string {
  if (!userType) return "Staff";
  return userType.charAt(0).toUpperCase() + userType.slice(1);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export function getRoleComparison(): {
  level: string;
  authorisation: number;
  highlights: string[];
}[] {
  return [
    {
      level: "Priority / Lead",
      authorisation: 1,
      highlights: [
        "Reassign tickets across departments",
        "Analytics cost and dwell insights",
        "Reopen closed vault cases",
        "Higher priority on active tickets",
      ],
    },
    {
      level: "Standard staff",
      authorisation: 2,
      highlights: [
        "Raise and update site tickets",
        "Dashboard map and active cases",
        "Vault history for your site",
        "Profile and notification preferences",
      ],
    },
  ];
}

type LoginResponse = { token: string; user: User };

export async function loginWithEmailPassword(
  email: string,
  password: string
): Promise<User> {
  const result = await request<LoginResponse>(API_URL, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!result?.user?.id || !result.token) {
    throw new Error("Invalid email or password.");
  }

  await persistSession(result.user.id, result.token);
  return result.user;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>(API_URL, "/cases/analytics");
}

export async function checkAnalyticsHealth(): Promise<HealthStatus> {
  try {
    await getAnalyticsSummary();
    return { ok: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach analytics API";
    return { ok: false, message };
  }
}

export async function checkApiHealth(): Promise<HealthStatus> {
  try {
    const res = await request<{
      ok?: boolean;
      database?: string;
      status?: string;
    }>(API_URL, "/health");
    if (res.ok) {
      return { ok: true, message: "PostgreSQL connected" };
    }
    return { ok: false, message: "API unhealthy" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach API";
    return { ok: false, message };
  }
}

/** @deprecated Use checkApiHealth */
export const checkExpressHealth = checkApiHealth;

export async function checkCasesHealth(): Promise<HealthStatus> {
  try {
    await request<unknown>(API_URL, "/cases");
    return { ok: true, message: "Connected" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach cases API";
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
