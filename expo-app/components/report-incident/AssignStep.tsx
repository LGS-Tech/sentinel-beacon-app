import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

type Department = { id: number; name: string };
type Person = { id: number; name: string; departmentId?: number | null };

type Props = {
  departments: Department[];
  people: Person[];
  departmentId: number | null;
  personId: number | null;
  onSelectDepartment: (id: number) => void;
  onSelectPerson: (id: number) => void;
};

export default function AssignStep({
  departments,
  people,
  departmentId,
  personId,
  onSelectDepartment,
  onSelectPerson,
}: Props) {
  const { width } = useWindowDimensions();
  const twoColumns = width >= 768;
  const [search, setSearch] = useState('');

  const peopleInDepartment = people
    .filter((p) => p.departmentId === departmentId)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View>
      <Text style={styles.heading}>👤 Assign & Submit</Text>
      <Text style={styles.subheading}>Please assign & submit your report</Text>

      <View style={[styles.panel, twoColumns && styles.columns]}>
        <View style={twoColumns ? styles.column : undefined}>
          <Text style={styles.label}>Department</Text>
          {departments.map((d) => {
            const selected = departmentId === d.id;
            return (
              <Pressable
                key={d.id}
                style={({ pressed }) => [
                  styles.card,
                  selected && styles.cardSelected,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => onSelectDepartment(d.id)}
              >
                <Text style={styles.icon}>🏢</Text>
                <Text style={styles.cardTitle}>{d.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={twoColumns ? styles.column : undefined}>
          <Text style={styles.label}>Person</Text>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name"
          />
          {departmentId === null ? (
            <Text style={styles.muted}>Pick a department first</Text>
          ) : peopleInDepartment.length === 0 ? (
            <Text style={styles.muted}>No people found</Text>
          ) : (
            peopleInDepartment.map((p) => {
              const selected = personId === p.id;
              return (
                <Pressable
                  key={p.id}
                  style={({ pressed }) => [
                    styles.card,
                    selected && styles.cardSelected,
                    pressed && styles.cardPressed,
                  ]}
                  onPress={() => onSelectPerson(p.id)}
                >
                  <Text style={styles.icon}>🙂</Text>
                  <Text style={[styles.cardTitle, { flex: 1 }]}>{p.name}</Text>
                  <Text>{selected ? '✅' : '⚪'}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 18, fontWeight: '700' },
  subheading: { color: '#666', marginBottom: 12 },
  panel: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#DDD', padding: 14,
  },
  columns: { flexDirection: 'row', gap: 16 },
  column: { flex: 1 },
  label: { fontWeight: '700', marginBottom: 8 },
  search: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8,
    padding: 10, marginBottom: 8, backgroundColor: '#F9FAFB',
  },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, borderWidth: 1, borderColor: '#DDD', padding: 12, marginBottom: 8,
  },
  cardSelected: { borderColor: '#D71920', backgroundColor: '#FDECEC' },
  cardPressed: { opacity: 0.7 },
  icon: { fontSize: 22, marginRight: 10 },
  cardTitle: { fontWeight: '600' },
  muted: { color: '#888' },
});