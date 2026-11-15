import React from 'react';
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

type Props = {
  category: string;
  subType: string;
  description: string;
  priority: string;
  severity: string;
  note: string;
  onNoteChange: (value: string) => void;
};

const ICONS: Record<string, string> = {
  'IT Support': '💻',
  Facilities: '🧹',
  Engineering: '⚙️',
  Injury: '🩹',
};

export default function ReviewStep({
  category,
  subType,
  description,
  priority,
  severity,
  note,
  onNoteChange,
}: Props) {
  const { width } = useWindowDimensions();
  const twoColumns = width >= 768;

  return (
    <View>
      <Text style={styles.heading}>📋 Review & Details</Text>
      <Text style={styles.subheading}>Please review the details before submitting</Text>

      <View style={twoColumns ? styles.columns : undefined}>
        <View style={twoColumns ? styles.column : undefined}>
          <View style={styles.card}>
            <Text style={styles.icon}>{ICONS[category] ?? '📌'}</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Emergency Type</Text>
              <Text style={styles.strong}>{category}</Text>
              <Text style={styles.muted}>{subType}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.icon}>🗓️</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Incident Details</Text>
              <Text style={styles.strong}>{description || 'No description'}</Text>
              <Text style={styles.muted}>
                Priority: {priority} · Severity: {severity}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.icon}>📍</Text>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Location</Text>
              <Text style={styles.muted}>Coming with the Location step</Text>
            </View>
          </View>
        </View>

        <View style={twoColumns ? styles.column : undefined}>
          <View style={styles.panel}>
            <Text style={styles.cardTitle}>📎 Attachments</Text>
            <Text style={styles.muted}>Attachments will be added here later.</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.cardTitle}>
              Add a quick note <Text style={styles.muted}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.note}
              multiline
              maxLength={200}
              value={note}
              onChangeText={onNoteChange}
              placeholder="Type a note..."
            />
            <Text style={styles.counter}>{note.length} / 200</Text>
          </View>
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
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    borderRadius: 12, borderWidth: 1, borderColor: '#DDD', padding: 14, marginBottom: 10,
  },
  icon: { fontSize: 30, marginRight: 14 },
  cardBody: { flex: 1 },
  cardTitle: { fontWeight: '700', marginBottom: 4 },
  strong: { fontWeight: '600' },
  muted: { color: '#666', marginTop: 2 },
  panel: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#DDD', padding: 14, marginBottom: 10,
  },
  note: {
    borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 10,
    minHeight: 80, textAlignVertical: 'top', marginTop: 6,
  },
  counter: { textAlign: 'right', color: '#888', fontSize: 12, marginTop: 2 },
});