//-vault - needs an exposql update for storing pics and videos, live feed messages need reading
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import React, {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native"

import {
  useFocusEffect,
} from "@react-navigation/native"

import * as SQLite from "expo-sqlite"
import { ThemedText } from "../../components/themed-text"
import { ThemedView } from "../../components/themed-view"

const db = SQLite.openDatabaseSync("app.db")

type FileItem = {
  id: string
  name: string
  type: "text"
  content: string
}

type CaseItem = {
  id: string
  title: string
  createdAt: string
  status: "OPEN" | "CLOSED"
  files: FileItem[]
}

const setupVaultDb = () => {



  db.execSync(`
  CREATE TABLE IF NOT EXISTS vault_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    createdAt INTEGER,
    status TEXT DEFAULT 'CLOSED'
  );
`)

  const columns = db.getAllSync(`
    PRAGMA table_info(vault_cases)
  `) as any[]

  const columnNames = columns.map(
    (col) => col.name
  )

  if (!columnNames.includes("chat")) {

    db.execSync(`
      ALTER TABLE vault_cases
      ADD COLUMN chat TEXT;
    `)

  }

  //need to sort out reading live-feed messages but think its a dashboard issue
  if (!columnNames.includes("feed")) {
    db.execSync(`
      ALTER TABLE vault_cases
      ADD COLUMN feed TEXT;
    `)

  }

  if (!columnNames.includes("status")) {

  db.execSync(`
    ALTER TABLE vault_cases
    ADD COLUMN status TEXT DEFAULT 'CLOSED';
  `)

}


  
}

// looks good, just needs proper backend now
const loadCases = (): CaseItem[] => {

  const rows = db.getAllSync(
    `
      SELECT *
      FROM vault_cases
      ORDER BY createdAt DESC
    `
  ) as any[]

  return rows.map((row) => {



    const files: FileItem[] = [
      {
        id: `chat-${row.id}`,
        name: "team-chat.txt",
        type: "text",
        content: row.chat || "No chat data",
      },
      {
        id: `feed-${row.id}`,
        name: "live-feed.txt",
        type: "text",
        content: row.feed || "No live feed data",
      },
    ]

    return {

  id: row.id.toString(),
  title: row.title,
  createdAt: new Date(
    row.createdAt
  ).toISOString(),
  status: row.status || "CLOSED",
  files,
}
  })
}

export default function VaultScreen() {

  const [vaultData, setVaultData] =
    useState<CaseItem[]>([])

  const [selectedText, setSelectedText] =
    useState<string | null>(null)

  const [search, setSearch] =
    useState("")

  const [renameModalOpen, setRenameModalOpen] =
    useState(false)
  const [renameValue, setRenameValue] =
    useState("")

  const [selectedFileId, setSelectedFileId] =
    useState<string | null>(null)

  const [selectedCaseId, setSelectedCaseId] =
    useState<string | null>(null)

  const [renameType, setRenameType] =
    useState<"file" | "folder">("file")

  useEffect(() => {
    setupVaultDb()

  }, [])

  useFocusEffect(
    React.useCallback(() => {

      setVaultData(loadCases())
    }, [])
  )

  const refreshVault = () => {
    setVaultData(loadCases())
  }

  const deleteCase = (
    caseId: string
  ) => {

    Alert.alert(
      "Delete Folder",
      "Are you sure you want to permanently delete this folder?",
      [
        {
          text: "Cancel",
          style: "cancel",

        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {

            db.runSync(
              `
                DELETE FROM vault_cases
                WHERE id = ?
              `,
              [caseId]
            )

            refreshVault()
          },
        },
      ]
    )


  }

  const renameFile = () => {

    if (
      !selectedFileId ||
      !selectedCaseId ||
      !renameValue.trim()
    ) return

    const updatedCases = vaultData.map((c) => {

      if (c.id !== selectedCaseId) {
        return c
      }

      return {
        ...c,
        files: c.files.map((f) => {

          if (f.id !== selectedFileId) {
            return f
          }

          return {
            ...f,
            name: renameValue.trim(),
          }
        }),
      }
    })

    setVaultData(updatedCases)

    setRenameModalOpen(false)
    setRenameValue("")
  }


  const renameFolder = () => {
    if (
      !selectedCaseId ||
      !renameValue.trim()
    ) return

    db.runSync(
      `
        UPDATE vault_cases
        SET title = ?
        WHERE id = ?
      `,
      [
        renameValue.trim(),
        selectedCaseId,
      ]
    )

    refreshVault()

    setRenameModalOpen(false)

    setRenameValue("")
  }

  const openRenameFile = (
    caseId: string,
    fileId: string,
    currentName: string
  ) => {

    setRenameType("file")

    setSelectedCaseId(caseId)

    setSelectedFileId(fileId)

    setRenameValue(currentName)

    setRenameModalOpen(true)
  }

  const openRenameFolder = (
    caseId: string,
    currentTitle: string
  ) => {

    setRenameType("folder")

    setSelectedCaseId(caseId)

    setRenameValue(currentTitle)

    setRenameModalOpen(true)
  }

  const formatDate = (
    dateString: string
  ) => {

    const date = new Date(dateString)

    const formattedDate =
      `${String(
        date.getDate()
      ).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`

    const formattedTime =
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

    return `${formattedDate} • ${formattedTime}`
  }

  const filteredCases = useMemo(() => {

    return vaultData.filter((item) =>
      item.title
        .toLowerCase()
        .includes(search.toLowerCase())
    )

  }, [vaultData, search])

  const renderFile = ({
    item,
    caseId,
  }: {
    item: FileItem
    caseId: string
  }) => (

    <Pressable
      style={({ pressed }) => [
        styles.fileItem,
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => {
        setSelectedText(item.content)
      }}
    >

      <View
        style={[
          styles.fileIconBox,
          {
            backgroundColor: "#D1FAE5",
          },
        ]}
      >

        <Ionicons
          name="reader-outline"
          size={20}
          color="#059669"
        />

      </View>

      <View style={{ flex: 1 }}>

        <ThemedText style={styles.fileName}>
          {item.name}
        </ThemedText>

        <ThemedText style={styles.fileType}>
          TEXT
        </ThemedText>

      </View>

      <Pressable
        style={styles.renameBtn}
        onPress={() => {

          openRenameFile(
            caseId,
            item.id,
            item.name
          )

        }}
      >

        <Ionicons
          name="create-outline"
          size={18}
          color="#2563EB"
        />

      </Pressable>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#9CA3AF"
      />

    </Pressable>
  )

  const renderCase = ({
    item,
  }: {
    item: CaseItem
  }) => (

    <ThemedView style={styles.card}>

      <LinearGradient
        colors={["#2563EB", "#1D4ED8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >

        <View style={styles.caseIcon}>

          <Ionicons
            name="folder-open"
            size={22}
            color="#fff"
          />

        </View>

        <View style={{ flex: 1 }}>

          <ThemedText style={styles.caseTitle}>
            {item.title}
          </ThemedText>

          <View
            style={[
              styles.statusBadge,
              item.status === "OPEN"
              ? styles.openBadge
              : styles.closedBadge,
            ]}
          >
            <ThemedText
              style={styles.statusBadgeText}
            >
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

            openRenameFolder(
              item.id,
              item.title
            )

          }}
        >

          <Ionicons
            name="create-outline"
            size={18}
            color="#fff"
          />

        </Pressable>

        <Pressable
          style={styles.deleteBtn}
          onPress={() => {
            deleteCase(item.id)
          }}
        >

          <Ionicons
            name="trash-outline"
            size={20}
            color="#fff"
          />

        </Pressable>

      </LinearGradient>

      <View style={styles.filesContainer}>

        <FlatList
          data={item.files}
          keyExtractor={(f) => f.id}
          renderItem={({ item: file }) =>
            renderFile({
              item: file,
              caseId: item.id,
            })
          }
          scrollEnabled={false}
        />

      </View>

    </ThemedView>
  )

  return (
    <ThemedView style={styles.container}>
      

      <View style={styles.searchContainer}>

        <Ionicons
          name="search-outline"
          size={20}
          color="#9CA3AF"
        />

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

          <ThemedText style={styles.statValue}>
            {vaultData.length}
          </ThemedText>

          <ThemedText style={styles.statLabel}>
            Total Cases
          </ThemedText>

        </View>

        <View style={styles.statCard}>

          <ThemedText style={styles.statValue}>
            {vaultData.reduce(
              (a, b) => a + b.files.length,
              0
            )}
          </ThemedText>

          <ThemedText style={styles.statLabel}>
            Files
          </ThemedText>

        </View>

      </View>

      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        renderItem={renderCase}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      {/* file viewer */}
      <Modal
        visible={!!selectedText}
        transparent
        animationType="fade"
      >

        <View style={styles.modal}>

          <Pressable
            style={styles.overlay}
            onPress={() =>
              setSelectedText(null)
            }
          />

          <View style={styles.textBox}>

            <View style={styles.modalHeader}>

              <ThemedText style={styles.modalTitle}>
                File Content
              </ThemedText>

              <Pressable
                onPress={() =>
                  setSelectedText(null)
                }
              >

                <Ionicons
                  name="close"
                  size={22}
                  color="#111827"
                />

              </Pressable>

            </View>

            <ScrollView>

              <ThemedText style={styles.textContent}>
                {selectedText}
              </ThemedText>

            </ScrollView>

          </View>

        </View>

      </Modal>

      {/* rename modal */}
      <Modal
        visible={renameModalOpen}
        transparent
        animationType="fade"
      >

        <View style={styles.modal}>

          <Pressable
            style={styles.overlay}
            onPress={() => {
              setRenameModalOpen(false)
            }}
          />

          <View style={styles.renameBox}>

            <ThemedText style={styles.modalTitle}>
              Rename {renameType === "file"
                ? "File"
                : "Folder"}
            </ThemedText>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={styles.renameInput}
              placeholder={
                renameType === "file"
                  ? "Enter file name"
                  : "Enter folder name"
              }
              placeholderTextColor="#9CA3AF"
            />

            <Pressable
              style={styles.saveRenameBtn}
              onPress={() => {

                if (
                  renameType === "file"
                ) {
                  renameFile()
                } else {
                  renameFolder()
                }

              }}
            >

              <ThemedText
                style={styles.saveRenameText}
              >
                Save Changes
              </ThemedText>

            </Pressable>

          </View>

        </View>

      </Modal>

    </ThemedView>
  )
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6FB",
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    marginTop: 35,
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
    marginBottom: 14,
    marginTop: 40,
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
    paddingVertical: 18 ,
    borderRadius: 18,
    alignItems: "center",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827" ,
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
  },

  topSection: {
    flexDirection: "row",
    alignItems: "center",
    padding:  18,
  },

  caseIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight:  14,
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

  deleteBtn: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "rgba(220,38,38,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft:  10 ,
  },

  renameFolderBtn: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 12 ,
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
    letterSpacing:  1,
  },

  renameBtn: {
    marginRight: 12,
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

  textBox: {
    width: "88%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },

  renameBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
  },

  renameInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    color: "#111827",
  },


  saveRenameBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
  },

  saveRenameText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
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

  statusBadge: {
  alignSelf: "flex-start",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  marginTop: 6,
},

openBadge: {
  backgroundColor: "#DCFCE7",
},

closedBadge: {
  backgroundColor: "#E5E7EB",
},

statusBadgeText: {
  fontSize: 11,
  fontWeight: "700",
  color: "#111827",
},



}
)