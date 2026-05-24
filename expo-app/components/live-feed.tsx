// Live activity feed shown during incidents

import React, { useEffect, useState } from "react"
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabaseSync("app.db")

type FeedItem = {
  id: string
  time: string
  message: string
}


// setup table
export const ensureFeedTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS live_feed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      createdAt INTEGER
    );
  `)
}


// helper for formatting time
const formatTime = (timestamp: number) => {
  const d = new Date(timestamp)

  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")

  return `${h}:${m}`
}


// load all feed rows
const loadFeed = (): FeedItem[] => {
  const rows = db.getAllSync(
    "SELECT * FROM live_feed ORDER BY createdAt DESC"
  ) as any[]

  return rows.map((row) => ({
    id: row.id.toString(),
    time: formatTime(row.createdAt),
    message: row.message,
  }))
}

// export all live feed entries for vault saving
export const getAllFeedItems = () => {
  const rows = db.getAllSync(
    "SELECT * FROM live_feed ORDER BY createdAt ASC"
  ) as any[]

  return rows
}


// add new feed item
export const addFeedItem = (message: string) => {
  db.runSync(
    "INSERT INTO live_feed (message, createdAt) VALUES (?, ?)",
    [message, Date.now()]
  )
}


// wipe feed for new case
export const clearFeed = () => {
  db.runSync("DELETE FROM live_feed")
}



export default function LiveFeedSheet() {

  const [logs, setLogs] = useState<FeedItem[]>([])


  useEffect(() => {

    ensureFeedTable()

    setLogs(loadFeed())

    // refresh every second while sheet open
    const interval = setInterval(() => {
      setLogs(loadFeed())
    }, 1000)

    return () => clearInterval(interval)

  }, [])



  return (
    <View style={styles.container}>

      <Text style={styles.title}>Live Updates</Text>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.logContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (

          <View style={styles.logRow}>

            <Text style={styles.time}>
              {item.time}
            </Text>

            <Text style={styles.message}>
              {item.message}
            </Text>

          </View>

        )}
      />

    </View>
  )
}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  logContainer: {
    backgroundColor: "#F4F6F9",
    borderRadius: 14,
    overflow: "hidden",
    paddingBottom: 8,
  },

  logRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  time: {
    width: 58,
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 1,
  },

  message: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
    paddingRight: 6,
  },

})