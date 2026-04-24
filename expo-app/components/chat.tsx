// Chat panel used by staff to coordinate in real time

import React, { useEffect, useState } from "react"
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabaseSync("app.db")

type Message = {
  id: string
  name: string
  text: string
  time: string
}


// quick table setup (same db as index)
const ensureChatTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      text TEXT,
      createdAt INTEGER
    );
  `)
}

export const clearMessages = () => {
  db.runSync("DELETE FROM messages")
}


// load messages from db
const loadMessages = (): Message[] => {
  const rows = db.getAllSync(
    "SELECT * FROM messages ORDER BY createdAt ASC"
  ) as any[]

  return rows.map((row) => {
    const date = new Date(row.createdAt)

    const hours = String(date.getHours()).padStart(2, "0")
    const mins = String(date.getMinutes()).padStart(2, "0")

    return {
      id: row.id.toString(),
      name: row.name,
      text: row.text,
      time: `${hours}:${mins}`,
    }
  })
}


// save message
export const addMessageToDb = (name: string, text: string) => {
  db.runSync(
    "INSERT INTO messages (name, text, createdAt) VALUES (?, ?, ?)",
    [name, text, Date.now()]
  )
}



export default function ChatSheet() {

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")


  // load messages on open
  useEffect(() => {

    ensureChatTable()

    const data = loadMessages()

    // if empty, seed initial messages once
    if (data.length === 0) {

      const seed = [
        {
          name: "Mrs Smith",
          text: "Spotted a male in the corridor outside C1. He has a red hoodie and white trainers, looks like he's in his early 20s",
        },
        {
          name: "Mrs Martin",
          text: "Sent a picture            View",
        },
        {
          name: "Mr Albot",
          text: "Police have been notified and are on the way",
        },
      ]

      seed.forEach((msg) => {
        addMessageToDb(msg.name, msg.text)
      })

      setMessages(loadMessages())
    } else {
      setMessages(data)
    }

  }, [])


  const handleSend = () => {
    if (!inputText.trim()) return

    const text = inputText.trim()

    // save to db
    addMessageToDb("Mr Wallace", text)

    // reload messages (simple approach)
    setMessages(loadMessages())

    setInputText("")
  }


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Team Chat</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={styles.messageBlk}>
            <Text style={styles.name}>{item.name}</Text>

            <View style={styles.messageRow}>
              <Text style={styles.messageTxt}>{item.text}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        style={{ flex: 1 }}
        inverted
      />

      <View style={styles.inputBar}>
        <TextInput
          placeholder="Type a message…"
          style={styles.input}
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
      </View>

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  messages: {
    paddingBottom: 12,
  },

  messageBlk: {
    marginBottom: 14,
  },

  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  messageTxt: {
    flex: 1,
    fontSize: 15,
    color: "#222",
    marginRight: 8,
  },

  time: {
    fontSize: 12,
    color: "#999",
  },

  inputBar: {
    borderTopWidth: 1,
    borderTopColor: "#E1E5EA",
    paddingTop: 10,
  },

  input: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F3F6",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#000",
  },
})
