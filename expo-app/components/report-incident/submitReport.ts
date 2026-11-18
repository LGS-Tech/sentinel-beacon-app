import { createCase } from '@/lib/db';

export type ReportData = {
  category: string;
  subType: string;
  details: { description: string; priority: string; severity: string };
  location: { building: string; floor: string; room: string; landmark: string };
  note: string;
  departmentId: number | null;
  personId: number | null;
  x: number;
  y: number;
};

const PRIORITY_MAP: Record<string, string> = {
  High: 'HIGH',
  Medium: 'NORMAL',
  Low: 'LOW',
};

export async function submitReport(data: ReportData) {
  return createCase({
    title: `${data.category} — ${data.subType}`,
    category: data.category,
    description: data.details.description || undefined,
    priority: PRIORITY_MAP[data.details.priority] ?? 'NORMAL',
    severity: data.details.severity,
    subType: data.subType,
    building: data.location.building,
    room: data.location.room || undefined,
    landmark: data.location.landmark || undefined,
    note: data.note || undefined,
    floor: data.location.floor,
    locationX: data.x,
    locationY: data.y,
    locationLabel: data.location.room || '',
    assignedDepartmentId: data.departmentId ?? undefined,
    assignedUserId: data.personId ?? undefined,
    status: 'ACTIVE',
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
    feed: '',
    chat: '',
  });
}