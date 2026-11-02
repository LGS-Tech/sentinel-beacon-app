import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import IntruderMap from '@/components/intruder-map';
import { showAlert } from '@/lib/alert';
import {
  getDepartments,
  getUsers,
  type Department,
  type User,
} from '@/lib/api';
import { createCase, uploadCaseAttachment } from '@/lib/db';
import {
  FLOORS,
  getFloorById,
  type FloorId,
} from '@/lib/floors';
import { pickVaultFile, type PickedVaultFile } from '@/lib/pickVaultFile';
import {
  formatLocationLabel,
  inferCategoryFromTitle,
  priorityLabel,
  REPORT_PRIORITIES,
  REPORT_SEVERITIES,
  REPORT_STEPS,
  severityLabel,
  type ReportPriority,
  type ReportSeverity,
} from '@/lib/reportIncident';

type AttachmentDraft = PickedVaultFile & { previewUri?: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  initialFloor: FloorId;
  uploadedFloorPlans: Partial<Record<FloorId, string>>;
};

export default function ReportIncidentWizard({
  visible,
  onClose,
  onSubmitted,
  initialFloor,
  uploadedFloorPlans,
}: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ReportPriority | null>(null);
  const [severity, setSeverity] = useState<ReportSeverity | null>(null);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);

  const [building, setBuilding] = useState('');
  const [floorId, setFloorId] = useState<FloorId>(initialFloor);
  const [room, setRoom] = useState('');
  const [landmark, setLandmark] = useState('');
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  const [note, setNote] = useState('');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [assignQuery, setAssignQuery] = useState('');
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    setSubmitting(false);
    setTitle('');
    setDescription('');
    setPriority(null);
    setSeverity(null);
    setAttachments([]);
    setBuilding('');
    setFloorId(initialFloor);
    setRoom('');
    setLandmark('');
    setCoords(null);
    setNote('');
    setAssignQuery('');
    setDepartmentId(null);
    setUserId(null);
  }, [visible, initialFloor]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      try {
        const [nextDepartments, nextUsers] = await Promise.all([
          getDepartments(),
          getUsers(),
        ]);
        if (cancelled) return;
        setDepartments(nextDepartments.filter((item) => item.isActive !== false));
        setUsers(nextUsers);
      } catch (error) {
        if (!cancelled) {
          console.warn(
            'report wizard failed to load assignees:',
            error instanceof Error ? error.message : error,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const floorPlan = uploadedFloorPlans[floorId]
    ? { uri: uploadedFloorPlans[floorId] }
    : getFloorById(floorId).image;

  const locationLabel = formatLocationLabel({
    building,
    floorId,
    room,
    landmark,
  });

  const detailsReady = Boolean(
    title.trim() && description.trim() && priority && severity,
  );
  const locationReady = Boolean(building.trim() && room.trim());
  const assignReady = departmentId != null || userId != null;

  const filteredDepartments = useMemo(() => {
    const q = assignQuery.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q),
    );
  }, [assignQuery, departments]);

  const filteredUsers = useMemo(() => {
    const q = assignQuery.trim().toLowerCase();
    return users.filter((user) => {
      if (departmentId != null && user.departmentId !== departmentId) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        user.name,
        user.username,
        user.email,
        user.department,
        user.role,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [assignQuery, departmentId, users]);

  async function addAttachment() {
    try {
      const file = await pickVaultFile();
      if (!file) return;
      const previewUri =
        file.uri ||
        (typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function' &&
        file.mimeType.startsWith('image/')
          ? URL.createObjectURL(file.blob)
          : undefined);
      setAttachments((prev) => [...prev, { ...file, previewUri }]);
    } catch (error) {
      showAlert(
        'Unable to add attachment',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUri?.startsWith('blob:')) {
        URL.revokeObjectURL(removed.previewUri);
      }
      return next;
    });
  }

  function goNext() {
    if (step === 0 && !detailsReady) return;
    if (step === 1 && !locationReady) return;
    if (step < REPORT_STEPS.length - 1) setStep(step + 1);
  }

  async function submit() {
    if (!assignReady || !priority || !severity || submitting) return;
    setSubmitting(true);
    try {
      const descriptionParts = [description.trim()];
      if (note.trim()) descriptionParts.push(note.trim());
      const created = await createCase({
        title: title.trim(),
        description: descriptionParts.join('\n\n'),
        category: inferCategoryFromTitle(title),
        priority,
        severity,
        status: 'ACTIVE',
        createdAt: Date.now(),
        lastUpdatedAt: Date.now(),
        floor: floorId,
        locationX: coords?.x ?? 0.5,
        locationY: coords?.y ?? 0.5,
        locationLabel,
        assignedDepartmentId: departmentId ?? undefined,
        assignedUserId: userId ?? undefined,
        feed: '',
        chat: '',
      });
      const caseId = String(created?._id ?? created?.id ?? '');
      if (caseId) {
        for (const file of attachments) {
          try {
            await uploadCaseAttachment(caseId, file);
          } catch (error) {
            console.warn(
              'attachment upload failed:',
              error instanceof Error ? error.message : error,
            );
          }
        }
      }
      onSubmitted();
      onClose();
    } catch (error) {
      showAlert(
        'Unable to submit report',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    if (step === 0) {
      return (
        <ScrollView contentContainerStyle={styles.stepBody}>
          <Text style={styles.stepTitle}>Report incident</Text>
          <Text style={styles.stepSubtitle}>Enter the details before choosing a location.</Text>

          <Text style={styles.fieldLabel}>1. Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. IT Support"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.fieldLabel}>2. Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Describe what happened"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.fieldLabel}>3. Priority</Text>
          <View style={styles.chipRow}>
            {REPORT_PRIORITIES.map((item) => {
              const selected = priority === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setPriority(item.value)}
                  style={[styles.choiceChip, selected && styles.choiceChipActive]}
                >
                  <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {priority ? (
            <Text style={styles.hint}>
              {REPORT_PRIORITIES.find((item) => item.value === priority)?.hint}
            </Text>
          ) : null}

          <Text style={styles.fieldLabel}>4. Severity</Text>
          <View style={styles.chipRow}>
            {REPORT_SEVERITIES.map((item) => {
              const selected = severity === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => setSeverity(item.value)}
                  style={[styles.choiceChip, selected && styles.choiceChipActive]}
                >
                  <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {severity ? (
            <Text style={styles.hint}>
              {REPORT_SEVERITIES.find((item) => item.value === severity)?.hint}
            </Text>
          ) : null}

          <Text style={styles.fieldLabel}>5. Attachments (optional)</Text>
          <View style={styles.attachRow}>
            {attachments.map((file, index) => (
              <Pressable
                key={`${file.name}-${index}`}
                onPress={() => removeAttachment(index)}
                style={styles.attachThumb}
              >
                {file.previewUri ? (
                  <Image source={{ uri: file.previewUri }} style={styles.attachImage} />
                ) : (
                  <Text style={styles.attachName} numberOfLines={2}>
                    {file.name}
                  </Text>
                )}
              </Pressable>
            ))}
            <Pressable style={styles.attachAdd} onPress={addAttachment}>
              <Text style={styles.attachAddText}>+</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }

    if (step === 1) {
      return (
        <View style={[styles.locationLayout, isDesktop && styles.locationLayoutDesktop]}>
          <View style={styles.mapPane}>
            <Text style={styles.stepTitle}>Location</Text>
            <Text style={styles.stepSubtitle}>Select the exact location on the floor plan.</Text>
            <View style={styles.mapBox}>
              <IntruderMap
                floorPlan={floorPlan}
                updateMode
                selectedCoords={coords || { x: 0.5, y: 0.5 }}
                showMarker={coords !== null}
                onMapPress={setCoords}
              />
            </View>
          </View>
          <ScrollView
            style={styles.locationFields}
            contentContainerStyle={styles.stepBody}
          >
            <Text style={styles.fieldLabel}>1. Building</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. XYZ Building"
              placeholderTextColor="#9CA3AF"
              value={building}
              onChangeText={setBuilding}
            />
            <Text style={styles.fieldLabel}>2. Floor</Text>
            <View style={styles.chipRow}>
              {FLOORS.map((floor) => {
                const selected = floorId === floor.id;
                return (
                  <Pressable
                    key={floor.id}
                    onPress={() => {
                      setFloorId(floor.id);
                      setCoords(null);
                    }}
                    style={[styles.choiceChip, selected && styles.choiceChipActive]}
                  >
                    <Text style={[styles.choiceChipText, selected && styles.choiceChipTextActive]}>
                      {floor.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.fieldLabel}>3. Room / Shop</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lecture Theatre 2"
              placeholderTextColor="#9CA3AF"
              value={room}
              onChangeText={setRoom}
            />
            <Text style={styles.fieldLabel}>4. Nearby landmark (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near east gate"
              placeholderTextColor="#9CA3AF"
              value={landmark}
              onChangeText={setLandmark}
            />
          </ScrollView>
        </View>
      );
    }

    if (step === 2) {
      return (
        <ScrollView contentContainerStyle={styles.stepBody}>
          <Text style={styles.stepTitle}>Review & details</Text>
          <Text style={styles.stepSubtitle}>Please review the details before submitting.</Text>
          <View style={styles.reviewGrid}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewKicker}>Emergency type</Text>
              <Text style={styles.reviewTitle}>{title.trim() || '—'}</Text>
              <Text style={styles.reviewMeta}>
                {priority ? `${priorityLabel(priority)} priority` : 'No priority'}
                {severity ? ` · ${severityLabel(severity)} severity` : ''}
              </Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewKicker}>Incident details</Text>
              <Text style={styles.reviewBody}>{description.trim() || '—'}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewKicker}>Location</Text>
              <Text style={styles.reviewTitle}>{building.trim() || '—'}</Text>
              <Text style={styles.reviewMeta}>{locationLabel || '—'}</Text>
            </View>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewKicker}>Attachments</Text>
              <View style={styles.attachRow}>
                {attachments.map((file, index) => (
                  <View key={`${file.name}-${index}`} style={styles.attachThumb}>
                    {file.previewUri ? (
                      <Image source={{ uri: file.previewUri }} style={styles.attachImage} />
                    ) : (
                      <Text style={styles.attachName} numberOfLines={2}>
                        {file.name}
                      </Text>
                    )}
                  </View>
                ))}
                <Pressable style={styles.attachAdd} onPress={addAttachment}>
                  <Text style={styles.attachAddText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.fieldLabel}>Add a quick note (optional)</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Type a note…"
                placeholderTextColor="#9CA3AF"
                value={note}
                onChangeText={setNote}
                maxLength={500}
                multiline
              />
              <Text style={styles.hint}>{note.length}/500</Text>
            </View>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.stepBody}>
        <Text style={styles.stepTitle}>Assign & submit</Text>
        <Text style={styles.stepSubtitle}>Please assign and submit your report.</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by name or department"
          placeholderTextColor="#9CA3AF"
          value={assignQuery}
          onChangeText={setAssignQuery}
        />
        <View style={[styles.assignLayout, isDesktop && styles.assignLayoutDesktop]}>
          <View style={styles.assignCol}>
            <Text style={styles.fieldLabel}>Department</Text>
            {filteredDepartments.map((item) => {
              const selected = departmentId === item.id;
              const count = users.filter((user) => user.departmentId === item.id).length;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setDepartmentId(item.id);
                    setUserId((current) => {
                      const stillValid = users.some(
                        (user) => user.id === current && user.departmentId === item.id,
                      );
                      return stillValid ? current : null;
                    });
                  }}
                  style={[styles.personCard, selected && styles.personCardActive]}
                >
                  <Text style={styles.personName}>{item.name}</Text>
                  <Text style={styles.personMeta}>
                    {item.kind} · {count} available
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.assignCol}>
            <Text style={styles.fieldLabel}>Person</Text>
            {filteredUsers.map((user) => {
              const selected = userId === user.id;
              return (
                <Pressable
                  key={user.id}
                  onPress={() => {
                    setUserId(user.id);
                    if (user.departmentId != null) setDepartmentId(user.departmentId);
                  }}
                  style={[styles.personCard, selected && styles.personCardActive]}
                >
                  <Text style={styles.personName}>{user.name}</Text>
                  <Text style={styles.personMeta}>
                    {user.department || user.role || 'Staff'} · Available
                  </Text>
                </Pressable>
              );
            })}
            {filteredUsers.length === 0 ? (
              <Text style={styles.hint}>No people match this search.</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    );
  }

  const nextEnabled =
    (step === 0 && detailsReady) ||
    (step === 1 && locationReady) ||
    step === 2 ||
    (step === 3 && assignReady && !submitting);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report incident</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.stepper}>
          {REPORT_STEPS.map((item, index) => {
            const active = index === step;
            const done = index < step;
            return (
              <View key={item.key} style={styles.stepperItem}>
                <View
                  style={[
                    styles.stepDot,
                    (active || done) && styles.stepDotActive,
                  ]}
                >
                  <Text style={styles.stepDotText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepperLabel, active && styles.stepperLabelActive]}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.body}>{renderStep()}</View>

        <View style={styles.footer}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              if (step === 0) onClose();
              else setStep(step - 1);
            }}
          >
            <Text style={styles.backText}>{step === 0 ? 'Cancel' : 'Back'}</Text>
          </Pressable>
          <Pressable
            style={[styles.nextBtn, !nextEnabled && styles.nextBtnDisabled]}
            disabled={!nextEnabled}
            onPress={step === 3 ? submit : goNext}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextText}>
                {step === 3 ? 'Submit report' : 'Next'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepperItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#DC2626',
  },
  stepDotText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  stepperLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  stepperLabelActive: {
    color: '#111827',
  },
  body: {
    flex: 1,
  },
  stepBody: {
    padding: 20,
    paddingBottom: 32,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#111827',
    fontSize: 15,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  choiceChipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  choiceChipText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  choiceChipTextActive: {
    color: '#991B1B',
  },
  hint: {
    marginTop: 8,
    color: '#6B7280',
    fontSize: 12,
  },
  attachRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  attachThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  attachImage: {
    width: 72,
    height: 72,
  },
  attachName: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  attachAdd: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachAddText: {
    fontSize: 28,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  locationLayout: {
    flex: 1,
  },
  locationLayoutDesktop: {
    flexDirection: 'row',
  },
  mapPane: {
    flex: 1,
    padding: 20,
    minHeight: 280,
  },
  mapBox: {
    flex: 1,
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  locationFields: {
    width: '100%',
    maxWidth: 420,
  },
  reviewGrid: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
  },
  reviewKicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  reviewBody: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reviewMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
  },
  assignLayout: {
    gap: 16,
    marginTop: 8,
  },
  assignLayoutDesktop: {
    flexDirection: 'row',
  },
  assignCol: {
    flex: 1,
    gap: 8,
  },
  personCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  personCardActive: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  personMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  backText: {
    fontWeight: '700',
    color: '#374151',
    fontSize: 15,
  },
  nextBtn: {
    flex: 1.2,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  nextBtnDisabled: {
    backgroundColor: '#F3A4A4',
  },
  nextText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});
