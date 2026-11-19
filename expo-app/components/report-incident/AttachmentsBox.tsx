import { PickedVaultFile, pickVaultFile } from '@/lib/pickVaultFile';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';




type Props = {
  files: PickedVaultFile[];
  onAdd: (file: PickedVaultFile) => void;
  onRemove: (index: number) => void;
};

export default function AttachmentsBox({ files, onAdd, onRemove }: Props) {
  async function handleAdd() {
    const file = await pickVaultFile();
    if (file) onAdd(file);
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>📎 Attachments (optional)</Text>

      {files.map((f, i) => (
        <View key={`${f.name}-${i}`} style={styles.fileRow}>
          <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
          <Pressable onPress={() => onRemove(i)} hitSlop={8}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
        onPress={handleAdd}
      >
        <Text style={styles.addText}>+ Add file</Text>
      </Pressable>
      <Text style={styles.hint}>TXT, PDF, JPG or PNG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#DDD', padding: 14, marginTop: 14,
  },
  title: { fontWeight: '700', marginBottom: 8 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F3F4F6', borderRadius: 8, padding: 8, marginBottom: 6,
  },
  fileName: { flex: 1, marginRight: 8 },
  remove: { color: '#DC2626', fontWeight: '700' },
  addBtn: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: '#999',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  addText: { fontWeight: '600' },
  hint: { color: '#888', fontSize: 12, marginTop: 6 },
});