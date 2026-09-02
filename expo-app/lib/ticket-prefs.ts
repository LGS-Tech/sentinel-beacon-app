import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sentinel.ticketPrefs.v1";

export type TicketCategory =
  | "Facilities"
  | "IT Support"
  | "Engineering"
  | "Injury";

export type TicketPriority = "normal" | "high";

export type TicketPrefs = {
  defaultCategory: TicketCategory;
  defaultPriority: TicketPriority;
  pinOnMapWhenRaising: boolean;
  showHiddenCostField: boolean;
  allowReopenClosed: boolean;
  quickUpdateFromMap: boolean;
  confirmBeforeSubmit: boolean;
};

export const ticketCategories: TicketCategory[] = [
  "Facilities",
  "IT Support",
  "Engineering",
  "Injury",
];

export const defaultTicketPrefs: TicketPrefs = {
  defaultCategory: "Facilities",
  defaultPriority: "normal",
  pinOnMapWhenRaising: true,
  showHiddenCostField: false,
  allowReopenClosed: false,
  quickUpdateFromMap: true,
  confirmBeforeSubmit: true,
};

export async function loadTicketPrefs(): Promise<TicketPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultTicketPrefs };
    return { ...defaultTicketPrefs, ...JSON.parse(raw) };
  } catch {
    return { ...defaultTicketPrefs };
  }
}

export async function saveTicketPrefs(prefs: TicketPrefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
