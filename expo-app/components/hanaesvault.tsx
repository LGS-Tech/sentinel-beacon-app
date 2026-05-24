/*import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";



type FileItem = {
  id: string;
  name: string;
  type: "image" | "document" | "text";
  uri?: string;
  content?: string;
};

type CaseItem = {
  id: string;
  title: string;
  createdAt: string;
  files: FileItem[];
};


const initialVaultData: CaseItem[] = [
  {
    id: "1",
    title: "Case #001",
    createdAt: "2026-03-19T14:26:00",
    files: [{ id: "f1", name: "notes.pdf", type: "document" }],
  },
  {
    id: "2",
    title: "Case #002",
    createdAt: "2026-03-19T16:12:00",
    files: [
      {
        id: "f2",
        name: "report.txt",
        type: "text",
        content: "Intruder detected near entrance at 21:43.",
      },
      {
        id: "f3",
        name: "scene.jpg",
        type: "image",
        uri: "https://picsum.photos/800",
      },
    ],
  },
];



export default function VaultScreen() {
  const [vaultData] = useState<CaseItem[]>(initialVaultData);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const getFileMeta = (type: string) => {
    switch (type) {
      case "image":
        return {
          icon: "image-outline",
          color: "#2563EB",
          bg: "#DBEAFE",
        };

      case "document":
        return {
          icon: "document-text-outline",
          color: "#7C3AED",
          bg: "#EDE9FE",
        };

      case "text":
        return {
          icon: "reader-outline",
          color: "#059669",
          bg: "#D1FAE5",
        };

      default:
        return {
          icon: "folder-outline",
          color: "#6B7280",
          bg: "#E5E7EB",
        };
    }
  };

  

  const filteredCases = useMemo(() => {
    return vaultData.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [vaultData, search]);



  const renderFile = ({ item }: { item: FileItem }) => {
    const meta = getFileMeta(item.type);

    return (
      <Pressable
        style={({ pressed }) => [styles.fileItem, pressed && { opacity: 0.7 }]}
        onPress={() => {
          if (item.type === "image" && item.uri) {
            setSelectedImage(item.uri);
          }

          if (item.type === "text" && item.content) {
            setSelectedText(item.content);
          }
        }}
      >
        <View style={[styles.fileIconBox, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon as any} size={20} color={meta.color} />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={styles.fileName}>{item.name}</ThemedText>

          <ThemedText style={styles.fileType}>
            {item.type.toUpperCase()}
          </ThemedText>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </Pressable>
    );
  };


  const renderCase = ({ item }: { item: CaseItem }) => (
    <ThemedView style={styles.card}>
      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >
        <View style={styles.caseIcon}>
          <Ionicons name="shield-checkmark" size={22} color="#fff" />
        </View>

        <View style={{ flex: 1 }}>
          <ThemedText style={styles.caseTitle}>{item.title}</ThemedText>

          <ThemedText style={styles.caseDate}>
            Created {formatDate(item.createdAt)}
          </ThemedText>
        </View>

        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{item.files.length}</ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.filesContainer}>
        <FlatList
          data={item.files}
          keyExtractor={(f) => f.id}
          renderItem={renderFile}
          scrollEnabled={false}
        />
      </View>
    </ThemedView>
  );


  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.title}>Vault</ThemedText>

          <ThemedText style={styles.subtitle}>
            Secure investigation cases
          </ThemedText>
        </View>

        <View style={styles.headerCircle}>
          <Ionicons name="lock-closed" size={22} color="#2563EB" />
        </View>
      </View>

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

      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modal}>
          <Pressable
            style={styles.overlay}
            onPress={() => setSelectedImage(null)}
          />

          {selectedImage && (
            <>
              <Pressable
                style={styles.closeBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>

              <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            </>
          )}
        </View>
      </Modal>

      <Modal visible={!!selectedText} transparent animationType="fade">
        <View style={styles.modal}>
          <Pressable
            style={styles.overlay}
            onPress={() => setSelectedText(null)}
          />

          <View style={styles.textBox}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Report Content</ThemedText>

              <Pressable onPress={() => setSelectedText(null)}>
                <Ionicons name="close" size={22} color="#111827" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={styles.textContent}>{selectedText}</ThemedText>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  headerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  searchContainer: {
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
    fontSize: 15,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },

  caseIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  caseTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  caseDate: {
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    fontSize: 12,
  },

  badge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
  },

  filesContainer: {
    padding: 16,
  },

  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  fileType: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 3,
    letterSpacing: 1,
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  closeBtn: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },

  fullImage: {
    width: "92%",
    height: "72%",
    resizeMode: "contain",
    borderRadius: 18,
  },

  textBox: {
    width: "88%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  textContent: {
    fontSize: 15,
    lineHeight: 25,
    color: "#374151",
  },
}); */
