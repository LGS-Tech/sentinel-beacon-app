//-vault - needs an exposql update for storing pics and videos, live feed messages need reading
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { deleteCase, getCases, updateCase } from '@/lib/db';

import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';

type FileItem = {
  id: string;
  name: string;
  type: 'text';
  content: string;
};

type CaseItem = {
  id: string;
  title: string;
  createdAt: number;
  lastUpdatedAt: number;
  status: 'ACTIVE' | 'CLOSED';
  locationX?: number;
  locationY?: number;
  locationLabel?: string;
  feed?: string;
  chat?: string;
  files: FileItem[];
};

const loadCases = async (): Promise<CaseItem[]> => {
  const rows = await getCases();

  return rows.map((row: any) => {
    const files: FileItem[] = [
      {
        id: `chat-${row._id ?? row.id}`,
        name: 'team-chat.txt',
        type: 'text',
        content: row.chat || 'No chat data',
      },

      {
        id: `feed-${row._id ?? row.id}`,
        name: 'live-feed.txt',
        type: 'text',
        content: row.feed || 'No live feed data',
      },
    ];

    return {
      id: String(row._id ?? row.id),

      title: row.title,

      createdAt: row.createdAt,

      lastUpdatedAt: row.lastUpdatedAt,

      status: row.status ?? 'CLOSED',

      locationX: row.locationX,

      locationY: row.locationY,

      locationLabel: row.locationLabel,

      feed: row.feed,

      chat: row.chat,

      files,
    };
  });
};

export default function VaultScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [vaultData, setVaultData] = useState<CaseItem[]>([]);

  const [selectedText, setSelectedText] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const [renameType, setRenameType] = useState<'file' | 'folder'>('file');

  const [expandedCase, setExpandedCase] = useState<CaseItem | null>(null);

  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const GRID_COLUMNS = 1;
  const PREVIEW_ROWS = 2;
  const PREVIEW_COUNT = GRID_COLUMNS * PREVIEW_ROWS;

  useEffect(() => {
    refreshVault();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      async function load() {
        const cases = await loadCases();

        setVaultData(cases);
      }

      load();
    }, []),
  );

  const refreshVault = async () => {
    const cases = await loadCases();

    setVaultData(cases);
  };

  const handleDeleteCase = (caseId: string) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to permanently delete this folder?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            await deleteCase(caseId);

            refreshVault();
          },
        },
      ],
    );
  };

  const renameFile = () => {
    if (!selectedFileId || !selectedCaseId || !renameValue.trim()) return;

    const updatedCases = vaultData.map((c) => {
      if (c.id !== selectedCaseId) {
        return c;
      }

      return {
        ...c,
        files: c.files.map((f) => {
          if (f.id !== selectedFileId) {
            return f;
          }

          return {
            ...f,
            name: renameValue.trim(),
          };
        }),
      };
    });

    setVaultData(updatedCases);

    setRenameModalOpen(false);
    setRenameValue('');
  };

  const renameFolder = async () => {
    if (!selectedCaseId || !renameValue.trim()) return;

    await updateCase(selectedCaseId, {
      title: renameValue.trim(),
      lastUpdatedAt: Date.now(),
    });

    await refreshVault();

    setRenameModalOpen(false);
    setRenameValue('');
  };

  const openRenameFile = (
    caseId: string,
    fileId: string,
    currentName: string,
  ) => {
    setRenameType('file');

    setSelectedCaseId(caseId);

    setSelectedFileId(fileId);

    setRenameValue(currentName);

    setRenameModalOpen(true);
  };

  const openRenameFolder = (caseId: string, currentTitle: string) => {
    setRenameType('folder');

    setSelectedCaseId(caseId);

    setRenameValue(currentTitle);

    setRenameModalOpen(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);

    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;

    const formattedTime = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${formattedDate} • ${formattedTime}`;
  };

  const filteredCases = useMemo(() => {
    return vaultData.filter((item) =>
      (item.title ?? '').toLowerCase().includes(search.toLowerCase()),
    );
  }, [vaultData, search]);

  const openCases = filteredCases.filter((c) => c.status === 'ACTIVE');

  const closedCases = filteredCases.filter((c) => c.status === 'CLOSED');

  const renderFile = ({ item, caseId }: { item: FileItem; caseId: string }) => (
    <Pressable
      style={({ pressed }) => [styles.fileItem, pressed && { opacity: 0.7 }]}
      onPress={() => {
        setSelectedText(item.content);
      }}
    >
      <View
        style={[
          styles.fileIconBox,
          {
            backgroundColor: '#D1FAE5',
          },
        ]}
      >
        <Ionicons name="reader-outline" size={20} color="#059669" />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText style={styles.fileName}>{item.name}</ThemedText>

        <ThemedText style={styles.fileType}>TEXT</ThemedText>
      </View>

      <Pressable
        style={styles.renameBtn}
        onPress={() => {
          openRenameFile(caseId, item.id, item.name);
        }}
      >
        <Ionicons name="create-outline" size={18} color="#2563EB" />
      </Pressable>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </Pressable>
  );

  const renderCase = ({ item }: { item: CaseItem }) => (
    <Pressable
      onPress={() => setExpandedCase(item)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <ThemedView style={styles.card}>
        <LinearGradient
          colors={['#2563EB', '#1D4ED8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topSection}
        >
          <View style={styles.caseIcon}>
            <Ionicons name="folder-open" size={22} color="#fff" />
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText style={styles.caseTitle}>{item.title}</ThemedText>

            <View
              style={[
                styles.statusBadge,
                item.status === 'ACTIVE'
                  ? styles.openBadge
                  : styles.closedBadge,
              ]}
            >
              <ThemedText style={styles.statusBadgeText}>
                {item.status}
              </ThemedText>
            </View>

            <ThemedText style={styles.caseDate}>
              Created {formatDate(item.createdAt)}
            </ThemedText>
          </View>

          <Pressable
            style={styles.renameFolderBtn}
            onPress={() => {
              openRenameFolder(item.id, item.title);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
          </Pressable>

          <Pressable
            style={styles.deleteBtn}
            onPress={() => {
              handleDeleteCase(item.id);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </Pressable>
        </LinearGradient>
      </ThemedView>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />

          <TextInput
            placeholder="Search cases..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{vaultData.length}</ThemedText>

            <ThemedText style={styles.statLabel}>Total Cases</ThemedText>
          </View>

          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>
              {vaultData.reduce((a, b) => a + b.files.length, 0)}
            </ThemedText>

            <ThemedText style={styles.statLabel}>Files</ThemedText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <ThemedText style={styles.sectionHeader}>Active Cases</ThemedText>

          {openCases.length === 0 ? (
            <ThemedText style={styles.emptySectionText}>
              There are no active cases
            </ThemedText>
          ) : (
            openCases.map((item) => (
              <View key={item.id}>{renderCase({ item })}</View>
            ))
          )}

          <ThemedText style={[styles.sectionHeader, { marginTop: 24 }]}>
            Closed Cases
          </ThemedText>

          {closedCases.length === 0 ? (
            <ThemedText style={styles.emptySectionText}>
              There are no closed cases
            </ThemedText>
          ) : (
            closedCases.map((item) => (
              <View key={item.id}>{renderCase({ item })}</View>
            ))
          )}
        </ScrollView>

        {/* rename modal */}
        <Modal visible={renameModalOpen} transparent animationType="fade">
          <View style={styles.modal}>
            <Pressable
              style={styles.overlay}
              onPress={() => {
                setRenameModalOpen(false);
              }}
            />

            <View style={styles.renameBox}>
              <ThemedText style={styles.modalTitle}>
                Rename {renameType === 'file' ? 'File' : 'Folder'}
              </ThemedText>

              <TextInput
                value={renameValue}
                onChangeText={setRenameValue}
                style={styles.renameInput}
                placeholder={
                  renameType === 'file'
                    ? 'Enter file name'
                    : 'Enter folder name'
                }
                placeholderTextColor="#9CA3AF"
              />

              <Pressable
                style={styles.saveRenameBtn}
                onPress={() => {
                  if (renameType === 'file') {
                    renameFile();
                  } else {
                    renameFolder();
                  }
                }}
              >
                <ThemedText style={styles.saveRenameText}>
                  Save Changes
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={!!expandedCase} animationType="slide">
          <View style={styles.fullFolderContainer}>
            <Pressable
              onPress={() => setExpandedCase(null)}
              style={styles.folderBackBtn}
            >
              <ThemedText>← Back</ThemedText>
            </Pressable>

            <ThemedText style={styles.folderTitle}>
              {expandedCase?.title}
            </ThemedText>

            {expandedCase?.locationLabel && (
              <ThemedText>Location: {expandedCase.locationLabel}</ThemedText>
            )}

            <FlatList
              data={expandedCase?.files || []}
              keyExtractor={(f) => f.id}
              numColumns={3}
              contentContainerStyle={{
                paddingBottom: 40,
              }}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.gridFile}
                  onPress={() => setSelectedFile(item)}
                >
                  <Ionicons name="reader-outline" size={22} color="#059669" />

                  <ThemedText numberOfLines={1} style={styles.gridFileName}>
                    {item.name}
                  </ThemedText>
                </Pressable>
              )}
            />

            <Pressable style={styles.addFileBtn} onPress={() => {}}>
              <Ionicons name="add" size={18} color="#fff" />

              <ThemedText style={styles.addFileBtnText}>Add File</ThemedText>
            </Pressable>

            <Modal visible={!!selectedFile} transparent animationType="fade">
              <View style={styles.modal}>
                <Pressable
                  style={styles.overlay}
                  onPress={() => setSelectedText(null)}
                />

                <View style={styles.textBox}>
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>
                      {selectedFile?.name}
                    </ThemedText>

                    <Pressable onPress={() => setSelectedFile(null)}>
                      <Ionicons name="close" size={22} color="#111827" />
                    </Pressable>
                  </View>

                  <ScrollView>
                    <ThemedText style={styles.textContent}>
                      {selectedFile?.content}
                    </ThemedText>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        </Modal>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FB',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  inner: {
    flex: 1,
  },

  innerDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginTop: 35,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  headerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchContainer: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
    marginTop: 40,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#111827',
    fontSize: 15,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
  },

  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },

  caseIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  caseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  caseDate: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontSize: 12,
  },

  deleteBtn: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  renameFolderBtn: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filesContainer: {
    padding: 16,
  },

  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  fileType: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    letterSpacing: 1,
  },

  renameBtn: {
    marginRight: 12,
  },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  textBox: {
    width: '88%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },

  renameBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },

  renameInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    color: '#111827',
  },

  saveRenameBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },

  saveRenameText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  textContent: {
    fontSize: 15,
    lineHeight: 25,
    color: '#374151',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },

  openBadge: {
    backgroundColor: '#DCFCE7',
  },

  closedBadge: {
    backgroundColor: '#E5E7EB',
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },

  sectionHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 20,
  },

  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  emptySectionText: {
    color: '#6B7280',
    marginBottom: 20,
    fontSize: 14,
  },

  fileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 50,
  },

  gridFile: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },

  gridPlaceholder: {
    width: '30%',
    aspectRatio: 1,
    opacity: 0,
  },

  gridFileName: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },

  showAllLink: {
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 5,
  },

  fullFolderContainer: {
    flex: 1,
    backgroundColor: '#F3F6FB',
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  folderBackBtn: {
    marginBottom: 16,
  },

  folderTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },

  moreFilesText: {
    textAlign: 'center',
    fontSize: 24,
    color: '#9CA3AF',
    marginTop: -4,
    marginBottom: 8,
  },

  addFileBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
  },

  addFileBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },

  folderFooter: {
    marginTop: 18,
    alignItems: 'center',
  },

  viewButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    marginLeft: 6,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontSize: 14,

    fontWeight: '600',
  },
});
