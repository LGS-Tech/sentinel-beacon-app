/**
 * Campus floor plans bundled in the app (Leon’s LGSUniFloorPlan assets).
 * Case coordinates are floor-specific; `floor` on a case must match one of these ids.
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

export function getFloorById(id: string | null | undefined): FloorDefinition {
  return FLOORS.find((f) => f.id === id) ?? FLOORS[0];
}

export function normalizeFloorId(value: unknown): FloorId {
  if (value === '2') return '2';
  return '1';
}

export function caseMatchesFloor(
  caseItem: { floor?: string | null },
  floorId: FloorId,
): boolean {
  return normalizeFloorId(caseItem?.floor) === floorId;
}
