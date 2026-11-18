import IntruderMap from '@/components/intruder-map';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export type LocationValue = {
  building: string;
  floor: string;
  room: string;
  landmark: string;
};

type Props = {
  value: LocationValue;
  onChange: (field: keyof LocationValue, v: string) => void;
  floorPlan: any;
  coords: { x: number; y: number } | null;
  onPickCoords: (c: { x: number; y: number }) => void;
};

const BUILDINGS = ['Main Building'];
const FLOORS = [
  { id: '1', label: '1st Floor' },
  { id: '2', label: '2nd Floor' },
];

export default function LocationStep({ value, onChange, floorPlan, coords, onPickCoords }: Props) {
  const { width } = useWindowDimensions();
  const twoColumns = width >= 768;

  return (
    <View>
      <Text style={styles.heading}>📍 Location</Text>
      <Text style={styles.subheading}>Select the exact location</Text>

      <View style={twoColumns ? styles.columns : undefined}>

        <View style={[styles.mapBox, twoColumns && styles.column]}>
            <IntruderMap
              floorPlan={floorPlan}
              updateMode={true}
              showMarker={coords !== null}
              selectedCoords={coords ?? { x: 0, y: 0 }}
              onMapPress={onPickCoords}
            />
        </View>

        <View style={twoColumns ? styles.column : undefined}>
          <Text style={styles.label}>1. Building</Text>
          <View style={styles.row}>
            {BUILDINGS.map((b) => (
              <Pressable
                key={b}
                style={({ pressed }) => [
                  styles.chip,
                  value.building === b && styles.chipSelected,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => onChange('building', b)}
              >
                <Text>{b}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>2. Floor</Text>
          <View style={styles.row}>
            {FLOORS.map((f) => (
              <Pressable
                key={f.id}
                style={({ pressed }) => [
                  styles.chip,
                  value.floor === f.id && styles.chipSelected,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => onChange('floor', f.id)}
              >
                <Text>{f.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>3. Room / Area</Text>
          <TextInput
            style={styles.input}
            value={value.room}
            onChangeText={(t) => onChange('room', t)}
            placeholder="e.g. Lecture Theatre 2"
          />

          <Text style={styles.label}>4. Nearby Landmark (optional)</Text>
          <TextInput
            style={styles.input}
            value={value.landmark}
            onChangeText={(t) => onChange('landmark', t)}
            placeholder="ex: near east exit, main gate"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '700' },
  subheading: { color: '#666', marginBottom: 12 },
  columns: { flexDirection: 'row', gap: 16 },
  column: { flex: 1 },
  mapBox: {
  height: 320, backgroundColor: '#E5E7EB', borderRadius: 12,
  overflow: 'hidden', marginBottom: 12,},
  label: { fontWeight: '700', marginTop: 12, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
  paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
  borderWidth: 1, borderColor: '#DDD', backgroundColor: '#FFF',},
  chipSelected: { borderColor: '#D71920', backgroundColor: '#FDECEC' },
  input: {backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1,borderColor: '#DDD', padding: 12,},
  muted: { color: '#666' },
});