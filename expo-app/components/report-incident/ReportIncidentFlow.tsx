import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getDepartments, getUsers } from '@/lib/api';
import type { FloorId } from '@/lib/floors';
import AssignStep from './AssignStep';
import DetailsStep from './DetailsStep';
import LocationStep, { LocationValue } from './LocationStep';
import ReviewStep from './ReviewStep';

 
import type { PickedVaultFile } from '@/lib/pickVaultFile';
import AttachmentsBox from './AttachmentsBox';
import { shared } from './styles';


const STEPS = ['Details', 'Location', 'Review', 'Assign'];


type Props = {
  visible: boolean;
  category: string;
  subType: string;
  initialFloor: FloorId;
  getFloorPlan: (floorId: FloorId) => any;

  onSubmit: (data: {
    details: { description: string; priority: string; severity: string };
    location: { building: string; floor: string; room: string; landmark: string };
    note: string;
    departmentId: number | null;
    personId: number | null;
    coords: { x: number; y: number } | null;
    files: PickedVaultFile[];
  }) => Promise<void>;
  onClose: () => void;
};

export default function ReportIncidentFlow({ visible, category, subType, initialFloor, getFloorPlan, onSubmit, onClose }: Props) {
  const [step, setStep] = useState(0);

  const [details, setDetails] = useState({
  description: '',
  priority: 'Medium',
  severity: 'Medium',
});

const [note, setNote] = useState('');
const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
const [files, setFiles] = useState<PickedVaultFile[]>([]);

const [location, setLocation] = useState<LocationValue>({
  building: 'Main Building',
  floor: initialFloor,
  room: '',
  landmark: '',
});

const [departments, setDepartments] = useState<any[]>([]);
const [people, setPeople] = useState<any[]>([]);
const [departmentId, setDepartmentId] = useState<number | null>(null);
const [personId, setPersonId] = useState<number | null>(null);


useEffect(() => {
  if (!visible) return;
  // The modal stays mounted, so clear the previous report and start from the dashboard's floor with no pin.
  setStep(0);
  setDetails({ description: '', priority: 'Medium', severity: 'Medium' });
  setNote('');
  setFiles([]);
  setCoords(null);
  setLocation({ building: 'Main Building', floor: initialFloor, room: '', landmark: '' });
  setDepartmentId(null);
  setPersonId(null);
  getDepartments().then(setDepartments).catch(() => {});
  getUsers().then(setPeople).catch(() => {});
}, [visible, initialFloor]);

const nextDisabled = step === 1 && coords === null;

function updateDetails(field: 'description' | 'priority' | 'severity', value: string) {
  setDetails((prev) => ({ ...prev, [field]: value }));
}

  function close() {
    setStep(0);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={shared.overlay}>
      <View style={shared.screen}>
        <Text style={styles.title}>Report Incident</Text>

        <View style={styles.stepper}>
          {STEPS.map((label, i) => (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.circle, i <= step && styles.circleActive]}>
                <Text style={[styles.circleText, i <= step && styles.circleTextActive]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={styles.stepLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {step === 0 ? (
              <>
                <DetailsStep
                    title={(category ?? '').toUpperCase()}
                    description={details.description}
                    priority={details.priority}
                    severity={details.severity}
                    onChange={updateDetails}
                />

                  <AttachmentsBox
                    files={files}
                    onAdd={(f) => setFiles((prev) => [...prev, f])}
                    onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  />
                  </>

                ) : step === 1 ? (
                <LocationStep
                      value={location}
                      floorPlan={getFloorPlan(location.floor)}
                      coords={coords}
                      onPickCoords={setCoords}
                      onChange={(field, v) => {
                        // A pin only makes sense on the floor it was placed on.
                        if (field === 'floor' && v !== location.floor) setCoords(null);
                        setLocation((prev) => ({ ...prev, [field]: v }));
                      }}
                />

                ) : step === 2 ? (
                <ReviewStep
                    category={category}
                    subType={subType}
                    description={details.description}
                    priority={details.priority}
                    severity={details.severity}
                    note={note}
                    location={location}
                    onNoteChange={setNote}
                    files={files}
                    onAdd={(f) => setFiles((prev) => [...prev, f])}
                    onRemove={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                />
                ) : step === 3 ? (
            <AssignStep
                departments={departments}
                people={people}
                departmentId={departmentId}
                personId={personId}
                onSelectDepartment={(id) => {
                setDepartmentId(id);
                setPersonId(null);
                }}
                onSelectPerson={setPersonId}
            />
            ) : (
            <Text>Step {step + 1}: {STEPS[step]} (coming next)</Text>
            )}

        </ScrollView>

        <View style={styles.buttons}>
          <Pressable
            style={styles.backBtn}
            onPress={() => (step === 0 ? close() : setStep(step - 1))}
          >
            <Text>← Back</Text>
          </Pressable>
          <Pressable
            style={[styles.nextBtn, nextDisabled && styles.nextBtnDisabled]}
            disabled={nextDisabled}
            onPress={async () => {
            if (step < 3) {
                setStep(step + 1);
                return;
            }
            try {
                await onSubmit({ details, location, note, departmentId, personId, coords, files });
                close();
            } catch (e) {
                console.error('Submit failed', e);
            }
            }}
          >
            <Text style={styles.nextText}>{step === 3 ? 'Submit Report' : 'Next →'}</Text>
          </Pressable>
        </View>
      </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
  width: '100%',
  maxWidth: 900,
  maxHeight: '92%',
  backgroundColor: '#F0F2F5',
  borderRadius: 20,
  padding: 24,
},
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  stepItem: { alignItems: 'center' },
  circle: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1,
    borderColor: '#999', justifyContent: 'center', alignItems: 'center',
  },
  circleActive: { backgroundColor: '#D71920', borderColor: '#D71920' },
  circleText: { color: '#333', fontWeight: '700' },
  circleTextActive: { color: '#FFF' },
  stepLabel: { marginTop: 6, fontSize: 12 },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 24, maxWidth: 700, width: '100%', alignSelf: 'center' },
  buttons: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#DDD',
    backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
  },
  nextBtn: {
    flex: 1, height: 50, borderRadius: 12, backgroundColor: '#D71920',
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextText: { color: '#FFF', fontWeight: '700' },

  overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
},
});