import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const PRIORITIES = [
  { label: 'High', color: '#c73737', bg: '#FDECEC', help: 'Operations halted, immediate resolution needed.' },
  { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7', help: 'Workflow affected, workaround available.' },
  { label: 'Low', color: '#16A34A', bg: '#DCFCE7', help: 'Minor issue, no operational impact.' },
];
const SEVERITIES = [
  { label: 'Critical', color: '#DC2626', bg: '#FDECEC', help: 'Service unavailable, no workaround.' },
  { label: 'High', color: '#EA580C', bg: '#FFEDD5', help: 'Service degraded, workaround available.' },
  { label: 'Medium', color: '#F59E0B', bg: '#FEF3C7', help: 'Service functional with acceptable impact.' },
  { label: 'Low', color: '#16A34A', bg: '#DCFCE7', help: 'Minor issue, no impact on usability.' },
];
type Props = {
  title: string;
  description: string;
  priority: string;
  severity: string;
  onChange: (field: 'description' | 'priority' | 'severity', value: string) => void;
};

export default function DetailsStep({ title, description, priority, severity, onChange }: Props) {
    const { width } = useWindowDimensions();
    const twoColumns = width >= 768;
  
  
    return (

        <View style={twoColumns ? styles.columns : undefined}>
      <View style={twoColumns ? styles.column : undefined}>
        <Text style={styles.label}>1. Title</Text>
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        <Text style={styles.label}>2. Description</Text>
        <TextInput
          style={styles.textArea}
          multiline
          maxLength={500}
          value={description}
          onChangeText={(t) => onChange('description', t)}
          placeholder="Describe the issue"
        />
        <Text style={styles.counter}>{description.length} / 500</Text>

        <Text style={styles.label}>3. Priority</Text>
        <View style={styles.row}>
          {PRIORITIES.map((p) => {
            const selected = priority === p.label;
            return (
              <Pressable
                key={p.label}
                style={[styles.chip, { borderColor: p.color }, selected && { backgroundColor: p.bg }]}
                onPress={() => onChange('priority', p.label)}
              >
                <Text style={{ color: p.color, fontWeight: selected ? '700' : '400' }}>
                  {selected ? '● ' : ''}{p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.helpBox}>
          {PRIORITIES.map((p) => (
            <Text key={p.label} style={styles.helpText}>
              • <Text style={{ fontWeight: '700' }}>{p.label}</Text> - {p.help}
            </Text>
          ))}
        </View>
      </View>

      <View style={twoColumns ? styles.column : undefined}>
        <Text style={styles.label}>4. Severity</Text>
        <View style={styles.row}>
          {SEVERITIES.map((s) => {
            const selected = severity === s.label;
            return (
              <Pressable
                key={s.label}
                style={[styles.chip, { borderColor: s.color }, selected && { backgroundColor: s.bg }]}
                onPress={() => onChange('severity', s.label)}
              >
                <Text style={{ color: s.color, fontWeight: selected ? '700' : '400' }}>
                  {selected ? '● ' : ''}{s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.helpBox}>
          {SEVERITIES.map((s) => (
            <Text key={s.label} style={styles.helpText}>
              • <Text style={{ fontWeight: '700' }}>{s.label}</Text> - {s.help}
            </Text>
          ))}
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>ⓘ Severity helps us understand the impact & respond faster</Text>
        </View>
      </View>
    </View>
  );
}

 
const styles = StyleSheet.create({
  label: { fontWeight: '700', marginTop: 14, marginBottom: 6 },
  titleBox: {
    backgroundColor: '#EEE', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#DDD',
  },
  titleText: { fontWeight: '600' },
  textArea: {
    backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1,
    borderColor: '#DDD', padding: 12, minHeight: 90, textAlignVertical: 'top',
  },
  counter: { textAlign: 'right', color: '#888', fontSize: 12, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    borderColor: '#DDD', backgroundColor: '#FFF', alignItems: 'center',
  },
  chipSelected: { borderColor: '#D71920', backgroundColor: '#FDECEC' },
  chipTextSelected: { color: '#D71920', fontWeight: '700' },
  helpBox: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 10, marginTop: 8 },
  helpText: { fontSize: 12, color: '#444', marginBottom: 2 },
  infoBox: { backgroundColor: '#E0F2FE', borderRadius: 8, padding: 10, marginTop: 8 },
infoText: { fontSize: 12, color: '#0369A1' },
columns: { flexDirection: 'row', gap: 16 },
column: { flex: 1 },
});