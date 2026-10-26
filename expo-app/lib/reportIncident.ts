import { getFloorById, type FloorId } from '@/lib/floors';

export const REPORT_STEPS = [
  { key: 'details', label: 'Details' },
  { key: 'location', label: 'Location' },
  { key: 'review', label: 'Review' },
  { key: 'assign', label: 'Assign' },
] as const;

export type ReportPriority = 'HIGH' | 'NORMAL' | 'LOW';
export type ReportSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const REPORT_PRIORITIES: {
  value: ReportPriority;
  label: string;
  hint: string;
}[] = [
  {
    value: 'HIGH',
    label: 'High',
    hint: 'Immediate threat to occupants and/or assets.',
  },
  {
    value: 'NORMAL',
    label: 'Medium',
    hint: 'No threat of harm, yet operational impact.',
  },
  {
    value: 'LOW',
    label: 'Low',
    hint: 'Minor issues, no operational impact.',
  },
];

export const REPORT_SEVERITIES: {
  value: ReportSeverity;
  label: string;
  hint: string;
}[] = [
  {
    value: 'CRITICAL',
    label: 'Critical',
    hint: 'Severe casualties, uncontained.',
  },
  {
    value: 'HIGH',
    label: 'High',
    hint: 'Fire / gas leak, contained locally.',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    hint: 'Device function with attempted repair.',
  },
  {
    value: 'LOW',
    label: 'Low',
    hint: 'Minor issue, no impact or visibility.',
  },
];

const CATEGORIES = [
  'Fire',
  'Intruder',
  'Injury',
  'Maintenance',
  'Missing',
  'Facilities',
  'IT Support',
  'Engineering',
] as const;

export function inferCategoryFromTitle(title: string): string {
  const trimmed = title.trim().toLowerCase();
  if (!trimmed) return 'Maintenance';
  const match = CATEGORIES.find(
    (category) =>
      trimmed === category.toLowerCase() ||
      trimmed.startsWith(category.toLowerCase()),
  );
  return match ?? 'Maintenance';
}

export function formatLocationLabel(input: {
  building: string;
  floorId: FloorId;
  room: string;
  landmark: string;
}): string {
  const floor = getFloorById(input.floorId).label;
  return [input.building.trim(), floor, input.room.trim(), input.landmark.trim()]
    .filter(Boolean)
    .join(', ');
}

export function priorityLabel(value: ReportPriority): string {
  return REPORT_PRIORITIES.find((item) => item.value === value)?.label ?? value;
}

export function severityLabel(value: ReportSeverity): string {
  return REPORT_SEVERITIES.find((item) => item.value === value)?.label ?? value;
}
