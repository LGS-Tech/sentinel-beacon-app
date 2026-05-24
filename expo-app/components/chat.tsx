// Chat panel used by staff to coordinate in real time

import React, { useEffect, useRef, useState } from "react"

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

import { Ionicons } from "@expo/vector-icons"

const db = SQLite.openDatabaseSync("app.db")

type Message = {
  id: string
  name: string
  text: string
  time: string
}

// ensure table exists
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

// clear all messages
export const clearMessages = () => {
  db.runSync("DELETE FROM messages")
}

// load messages (oldest → newest)
const loadMessages = (): Message[] => {
  const rows = db.getAllSync(
    "SELECT * FROM messages ORDER BY createdAt ASC"
  ) as any[]

  return rows.map((row) => {

    const date = new Date(row.createdAt)

    const hours =
      String(date.getHours()).padStart(2, "0")

    const mins =
      String(date.getMinutes()).padStart(2, "0")

    return {
      id: row.id.toString(),
      name: row.name,
      text: row.text,
      time: `${hours}:${mins}`,
    }

  })
}

// export all chat messages for vault saving
export const getAllMessages = () => {
  const rows = db.getAllSync(
    "SELECT * FROM messages ORDER BY createdAt ASC"
  ) as any[]

  return rows
}

// add message
export const addMessageToDb = (
  name: string,
  text: string
) => {

  db.runSync(
    `
      INSERT INTO messages
      (name, text, createdAt)
      VALUES (?, ?, ?)
    `,
    [name, text, Date.now()]
  )

}

export default function ChatSheet() {

  const [messages, setMessages] =
    useState<Message[]>([])

  const [inputText, setInputText] =
    useState("")

  const listRef =
    useRef<FlatList>(null)

  const inputRef =
    useRef<TextInput>(null)

  useEffect(() => {

    ensureChatTable()

    setMessages(loadMessages())

    // auto focus input when sheet opens
    setTimeout(() => {
      inputRef.current?.focus()
    }, 250)

  }, [])

  const refreshMessages = () => {

    const data = loadMessages()

    setMessages(data)

  }

  const handleSend = () => {

    if (!inputText.trim()) return

    const text = inputText.trim()

    addMessageToDb(
      "Mr C Wallace",
      text
    )

    refreshMessages()

    setInputText("")

    // keep keyboard + focus active
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)

  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Team Chat
      </Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (

          <View style={styles.messageBlk}>

            <Text style={styles.name}>
              {item.name}
            </Text>

            <View style={styles.messageRow}>

              <Text style={styles.messageTxt}>
                {item.text}
              </Text>

              <Text style={styles.time}>
                {item.time}
              </Text>

            </View>

          </View>

        )}
        style={{ flex: 1 }}
        onContentSizeChange={() => {

          listRef.current?.scrollToEnd({
            animated: true,
          })

        }}
      />

      <View style={styles.inputBar}>

        {/* camera button */}
        <Pressable style={styles.cameraBtn}>

          <Ionicons
            name="camera"
            size={22}
            color="#4B5563"
          />

        </Pressable>

        {/* message input */}
        <TextInput
          ref={inputRef}
          placeholder="Type a message…"
          style={styles.input}
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit={false}
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
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E1E5EA",
    paddingTop: 10,
  },

  cameraBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F3F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F3F6",
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#000",
  },

})