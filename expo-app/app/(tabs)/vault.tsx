import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../../components/themed-text";
import { ThemedView } from "../../components/themed-view";

/* ================= DATA ================= */

const vaultData = [
  {
    id: "2",
    title: "Case 001",
    files: [{ id: "f4", name: "notes.pdf", type: "document" }],
  },
  {
    id: "3",
    title: "Case 002",
    files: [
      {
        id: "f6",
        name: "report2.txt",
        type: "text",
        content:
          "Intruder detected near entrance. Movement recorded at 21:43. Security alerted.",
      },
      { id: "f7", name: "summary.pdf", type: "document" },
      {
        id: "f8",
        name: "intruder_scene.jpg",
        type: "image",
        uri: "https://picsum.photos/800",
      },
    ],
  },
];

/* ================= COMPONENT ================= */

export default function VaultScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const renderFile = ({ item }: any) => (
    <Pressable
      style={styles.fileItem}
      onPress={() => {
        if (item.type === "image" && item.uri) {
          setSelectedImage(item.uri);
        } else if (item.type === "text" && item.content) {
          setSelectedText(item.content);
        }
      }}
    >
      <ThemedText style={styles.fileText}>
        {getFileIcon(item.type)} {item.name}
      </ThemedText>
    </Pressable>
  );

  const renderCase = ({ item }: any) => (
    <ThemedView style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <ThemedText style={styles.caseTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.caseSubtitle}>Evidence files</ThemedText>
        </View>

        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{item.files.length}</ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={item.files}
        keyExtractor={(file) => file.id}
        renderItem={renderFile}
        scrollEnabled={false}
      />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <ThemedText style={styles.header}>Vault</ThemedText>
        <ThemedText style={styles.subHeader}>
          Secure evidence & case files
        </ThemedText>
      </View>

      {/* LIST */}
      <FlatList
        data={vaultData}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* 🔥 IMAGE MODAL */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setSelectedImage(null)}
          />

          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          )}
        </View>
      </Modal>

      {/* 🔥 TEXT MODAL */}
      <Modal visible={!!selectedText} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalBackground}
            onPress={() => setSelectedText(null)}
          />

          <View style={styles.textModalBox}>
            <ThemedText style={styles.textContent}>{selectedText}</ThemedText>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

/* ================= HELPERS ================= */

function getFileIcon(type: string) {
  switch (type) {
    case "image":
      return "🖼️";
    case "document":
      return "📄";
    case "text":
      return "📝";
    default:
      return "📁";
  }
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FB",
  },

  headerContainer: {
    marginBottom: 24,
  },

  header: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },

  subHeader: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  caseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },

  caseSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#E5EDFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  badgeText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginVertical: 12,
  },

  fileItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  fileText: {
    fontSize: 14,
    color: "#374151",
  },

  /* MODALS */

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  fullImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 12,
  },

  textModalBox: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
  },

  textContent: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
  },
});
