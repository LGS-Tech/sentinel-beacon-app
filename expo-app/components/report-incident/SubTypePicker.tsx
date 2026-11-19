import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { shared } from './styles';


const SUBTYPES: Record<string, { label: string; description: string }[]> = {
  'IT Support': [
    { label: 'Internet / Network Issues', description: 'Problems with Wi-Fi, LAN connectivity or no internet' },
    { label: 'Software / Application Issues', description: 'Errors or issues with software or applications' },
    { label: 'System / Hardware Issues', description: 'Issues with computers, printers or other hardware' },
    { label: 'Email / Account Issue', description: 'Problems with email access, login or accounts' },
    { label: 'Others', description: 'Any other IT related problems' },
  ],
  Engineering: [
    { label: 'Electrical Issues', description: 'Power failure, wiring faults, tripped breakers etc' },
    { label: 'Plumbing Issue', description: 'Leakage, pipe burst, water supply or drainage issues' },
    { label: 'General Maintenance Issue', description: 'Heating, ventilation or air conditioning problems' },
    { label: 'Mechanical Issue', description: 'Faults in equipment, machinery or doors' },
    { label: 'Others', description: 'Any other Engineering related problems' },
  ],
  Injury: [
    { label: 'Minor Injury', description: 'Small injuries requiring only basic first aid' },
    { label: 'Major Injury', description: 'Serious injuries requiring hospital treatment' },
    { label: 'Chronic Injury / Illness', description: 'Small injuries requiring only basic first aid' },
    { label: 'Medical Treatment Injury', description: 'Injuries requiring medical care beyond basic first aid' },
    { label: 'Others', description: 'Something else not listed above' },
  ],
  Facilities: [{ label: 'Others', description: 'Any other facilities related problems' }],
};

type Props = {
  visible: boolean;
  category: string;
  onBack: () => void;
  onContinue: (subType: string) => void;
};

export default function SubTypePicker({ visible, category, onBack, onContinue }: Props) {
  const [selected, setSelected] = useState('');
  const options = SUBTYPES[category] ?? [];

  return (
    <Modal visible={visible}  transparent animationType="fade" onRequestClose={onBack}>
      <View style={shared.overlay}>
      <View style={shared.screen}>
        <Text style={styles.title}>What type of emergency is it?</Text>
        <Text style={styles.subtitle}>Select the {category} type</Text>

        {options.map((o) => (
          <Pressable
            key={o.label}
            style={[styles.card, selected === o.label && styles.cardSelected]}
            onPress={() => setSelected(o.label)}
          >
            <Text style={styles.cardTitle}>{o.label}</Text>
            <Text style={styles.cardText}>{o.description}</Text>
          </Pressable>
        ))}

        <View style={styles.buttons}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Text>← Back</Text>
          </Pressable>
          <Pressable
            style={[styles.nextBtn, !selected && { opacity: 0.5 }]}
            disabled={!selected}
            onPress={() => {
              onContinue(selected);
              setSelected('');
            }}
          >
            <Text style={styles.nextText}>Continue →</Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#DDD', padding: 14, marginBottom: 10,
  },
  cardSelected: { borderColor: '#D71920' },
  cardTitle: { fontWeight: '700', marginBottom: 2 },
  cardText: { color: '#666', fontSize: 13 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 'auto' },
  backBtn: {
    flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#DDD',
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
  },
  nextBtn: {
    flex: 1, height: 50, borderRadius: 12, backgroundColor: '#D71920',
    justifyContent: 'center', alignItems: 'center',
  },
  nextText: { color: '#FFF', fontWeight: '700' },
});