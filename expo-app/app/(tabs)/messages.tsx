//chat - gotta make it differentiate a bit more from vault UI, also need to get rid of the seconds timestamp
import React, { useCallback, useEffect, useState } from "react"

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native"


import { Ionicons } from "@expo/vector-icons"

import { useFocusEffect } from "@react-navigation/native"

//const db = SQLite.openDatabaseSync("app.db")
import { db } from "@/lib/db"

type CaseItem = {
  id: string
  title: string
  status: string
  date: string
}



function loadCases(): CaseItem[] {

  const rows = db.getAllSync(
    `
      SELECT *
      FROM vault_cases
      ORDER BY createdAt DESC
    `
  ) as any[]

  return rows.map((row) => ({
    id: row.id.toString(),
    title: row.title,
    status: row.status,
    date: new Date(
      row.createdAt
    ).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ),
  }))
}

export default function ChatTab() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [selectedCaseChat, setSelectedCaseChat] =useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [caseChat, setCaseChat] = useState("")
  const [showAllCases, setShowAllCases] = useState(false)


  function refreshCases() {
    setCases(loadCases())
  }

  function loadCaseChat(caseId: string) {

  const row = db.getFirstSync(
    `
      SELECT chat
      FROM vault_cases
      WHERE id = ?
    `,
    [caseId]
  ) as any

  setCaseChat(row?.chat || "")
}

function loadCaseMessages(caseId: string) {

  const row = db.getFirstSync(
    `
      SELECT chat
      FROM vault_cases
      WHERE id = ?
    `,
    [caseId]
  ) as any

  if (!row?.chat) {
    return []
  }

  return row.chat
    .split("\n")
    .filter(Boolean)
    .map((line: string, index: number) => ({

      id: index.toString(),

      text: line,

    }))
}

function handleSend() {

  if (!inputText.trim()) {
    return
  }

  const selectedCase = cases.find(
    c => c.id === selectedCaseId
  )

  if (
    !selectedCase ||
    selectedCase.status === "CLOSED"
  ) {
    return
  }

  const timestamp = new Date().toLocaleTimeString(
  "en-GB",
  {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
)

const newLine =
  `[${timestamp}] Mr C Wallace: ${inputText.trim()}`

  const row = db.getFirstSync(
    `
      SELECT chat
      FROM vault_cases
      WHERE id = ?
    `,
    [selectedCaseId]
  ) as any

  const updatedChat =
    row?.chat
      ? `${row.chat}\n${newLine}`
      : newLine

  db.runSync(
    `
      UPDATE vault_cases
      SET 
        chat = ?,
        lastUpdatedAt = ?,
      WHERE id = ?
    `,
    [
      updatedChat,
      Date.now(),
      selectedCaseId,
    ]
  )

  setMessages(
    loadCaseMessages(selectedCaseId!)
  )

  setInputText("")
}

  // initial load
  useEffect(() => {
    refreshCases()
  }, [])

  useEffect(() => {

  if (selectedCaseId) {

    setMessages(
      loadCaseMessages(selectedCaseId)
    )

  }

}, [selectedCaseId])

  // IMPORTANT: refresh every time you come back to this tab
  useFocusEffect(
    useCallback(() => {
      refreshCases()
    }, [])
  )

  const visibleCases = showAllCases
  ? [
      ...cases.filter(c => c.status === "OPEN"),
      ...cases.filter(c => c.status === "CLOSED"),
    ]
  : cases.filter(c => c.status === "OPEN")

  const openCases = cases.filter(
  c => c.status === "OPEN"
)


  // list of the conversations before specific one  picked
  if (!selectedCaseId) {
    if (cases.length === 0) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No Cases</Text>
          <Text style={styles.emptyText}>
            There are currently no active or archived cases.
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Conversations</Text>

        <Pressable
        onPress={() =>setShowAllCases(!showAllCases)}
      >
        <Text style={styles.toggleLink}>
          {showAllCases
          ? "Show Open"
          : "Show All"}
        </Text>
      </Pressable>

        <FlatList
  data={visibleCases}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Pressable
      style={[
        styles.caseCard,
        item.status === "CLOSED" && {
          opacity: 0.5,
        },
      ]}
      onPress={() => {
        loadCaseChat(item.id)
        setSelectedCaseId(item.id)
      }}
    >
      <View style={styles.row}>
        <Text style={styles.caseTitle}>
          {item.title}
        </Text>

        <View
          style={[
            styles.statusBadge,
            item.status === "OPEN"
              ? styles.openBadge
              : styles.closedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>
        {item.date}
      </Text>
    </Pressable>
  )}
  ListEmptyComponent={() => (

    !showAllCases ? (

      <Text
        style={styles.noOpenCasesText}
      >
        There are no open conversations
      </Text>

    ) : null

  )}
/>
      </View>
    )
  }



  // the actual chat view
  const selectedCase = cases.find(
    (c) => c.id === selectedCaseId
  )

  return (
  <View style={styles.chatContainer}>

    <Pressable
      onPress={() => setSelectedCaseId(null)}
      style={styles.backButton}
    >
      <Text style={styles.backText}>
        ← Conversations
      </Text>

      




    </Pressable>

    <Text style={styles.chatTitle}>
      {selectedCase?.title}
    </Text>

    <FlatList
  data={messages}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (

    <View style={styles.messageBlk}>

      <Text style={styles.messageTxt}>
        {item.text}
      </Text>

    </View>

  )}
  style={{ flex: 1 }}
  ListEmptyComponent={() => (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 120,
      }}
    >

      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 16,
          fontWeight: "600",
        }}
      >
        No chat history
      </Text>

    </View>

  )}
/>

    {selectedCase?.status === "OPEN" && (

      <View style={styles.inputBar}>

        <Pressable style={styles.cameraBtn}>

          <Ionicons
            name="camera"
            size={22}
            color="#4B5563"
          />

        </Pressable>

        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

      </View>

    )}

  </View>
)
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: "#F5F7FA",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },

  caseCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  caseTitle: {
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },

  date: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  openBadge: {
    backgroundColor: "#DCFCE7",
  },

  closedBadge: {
    backgroundColor: "#E5E7EB",
  },

  statusText: {
    fontWeight: "700",
    fontSize: 11,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
  },

  // ===== CHAT VIEW =====
  chatContainer: {
    flex: 1,
    backgroundColor: "#f0efef",
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  backButton: {
    marginBottom: 12,
  },

  backText: {
    color: "#60A5FA",
    fontSize: 14 ,
    fontWeight: "600",
  },

  chatTitle: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  chatHint: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  messageBlk: {
  marginBottom: 12,
  backgroundColor: "#dedede",
  padding: 12,
  borderRadius: 10,
},

messageTxt: {
  color: "#181818",
  fontSize: 14,
},

inputBar: {
  flexDirection: "row",
  alignItems: "center",
  paddingTop: 10,
  paddingBottom: 10,
  borderTopWidth: 1,
  borderTopColor: "#374151",
},

cameraBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#ffffff",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 10,
},

input: {
  flex: 1,
  height: 44,
  borderRadius: 22 ,
  backgroundColor: "#ffffff",
  paddingHorizontal: 16,
  color: "#000",
},

toggleLink: {
  color: "#2563EB",
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 16,
},

noOpenCasesText: {
  textAlign: "center",
  color: "#6B7280",
  marginTop: 20,
  fontSize: 15,
},




}
)