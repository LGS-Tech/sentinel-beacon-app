/**
 * Campus floor plans bundled in the app (Leon’s LGSUniFloorPlan assets).
 * Case coordinates are floor-specific; `floor` on a case must match one of these ids.
 *
 * IDs are the strings "1" | "2". APIs and Postgres may still send 1 / 2 as
 * numbers, so every comparison goes through parseFloorId().
 */
export type FloorId = '1' | '2';

export type FloorDefinition = {
  id: FloorId;
  label: string;
  image: any;
};

export const FLOORS: FloorDefinition[] = [
  {
    id: '1',
    label: 'Floor 1',
    image: require('../assets/images/LGSUniFloorPlan.png'),
  },
  {
    id: '2',
    label: 'Floor 2',
    image: require('../assets/images/LGSUniFloorPlan2.png'),
  },
];

export const DEFAULT_FLOOR_ID: FloorId = '1';

export function parseFloorId(value: unknown): FloorId | null {
  if (value == null || value === '') return null;
  const id = String(value).trim();
  return id === '1' || id === '2' ? id : null;
}

export function getFloorById(id: string | number | null | undefined): FloorDefinition {
  const parsed = parseFloorId(id);
  return FLOORS.find((f) => f.id === parsed) ?? FLOORS[0];
}

export function isFloorId(value: unknown): value is FloorId {
  return parseFloorId(value) !== null;
}

export function normalizeFloorId(value: unknown): FloorId {
  return parseFloorId(value) ?? DEFAULT_FLOOR_ID;
}

export function caseMatchesFloor(
  caseItem: { floor?: string | number | null },
  floorId: FloorId,
): boolean {
  return normalizeFloorId(caseItem?.floor) === floorId;
}
