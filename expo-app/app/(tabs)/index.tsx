import ChatSheet, { addMessageToDb } from "@/components/chat"
import IntruderMap from "@/components/intruder-map"
import LiveFeedSheet from "@/components/live-feed"
import PoliceConfirmation from "@/components/police-confirmation"
import BottomSheet from "@/components/sheet"
import { ThemedView } from "@/components/themed-view"

import React, { useEffect, useState } from "react"
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabaseSync("app.db")

const floorPlan = require("../../assets/images/LGSFloorPlan_v3.png")
const logo = require("../../assets/images/LGS-logo.png")

const windowHeight = Dimensions.get("window").height // prob not even needed


const DEFAULT_COORDS = { x: 0.52, y: 0.79 }
const DEFAULT_LABEL = "Bottom of Sports Hall"


type SavedLocation = {
  id: number
  x: number
  y: number
  label: string
}


// db setup
const setupDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS intruder_location (
      id INTEGER PRIMARY KEY NOT NULL,
      x REAL,
      y REAL,
      label TEXT
    );
  `)
}


// load
const loadLocation = (): SavedLocation | null => {
  const rows = db.getAllSync(
    "SELECT * FROM intruder_location LIMIT 1"
  ) as SavedLocation[]

  if (rows.length > 0) return rows[0]
  return null
}


// insert/update
const persistLocation = (x: number, y: number, label: string) => {
  const existing = loadLocation()

  if (existing) {
    db.runSync(
      "UPDATE intruder_location SET x = ?, y = ?, label = ? WHERE id = 1",
      [x, y, label]
    )
  } else {
    db.runSync(
      "INSERT INTO intruder_location (id, x, y, label) VALUES (1, ?, ?, ?)",
      [x, y, label]
    )
  }
}



export default function HomeScreen() {

  const [intruderLocation, setIntruderLocation] = useState(DEFAULT_LABEL)
  const [movementStatus, setMovementStatus] = useState("Stationary")
  const [responseStatus, setResponseStatus] = useState("Notified")

  const [lastLocationChange, setLastLocationChange] = useState(Date.now())

  const [confirmedCoords, setConfirmedCoords] =
    useState<{ x: number; y: number }>(DEFAULT_COORDS)

  const [updateMode, setUpdateMode] = useState(false)

  const [selectedCoords, setSelectedCoords] =
    useState<{ x: number; y: number } | null>(null)

  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [locationLabel, setLocationLabel] = useState("")

  const [chatOpen, setChatOpen] = useState(false)
  const [feedOpen, setFeedOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)



  useEffect(() => {

    setupDb()

    const saved = loadLocation()

    if (saved) {
      setConfirmedCoords({ x: saved.x, y: saved.y })
      setIntruderLocation(saved.label)
    } else {
      persistLocation(DEFAULT_COORDS.x, DEFAULT_COORDS.y, DEFAULT_LABEL)
    }

  }, [])



  useEffect(() => {

    const t = setInterval(() => {

      const diff = Date.now() - lastLocationChange

      if (diff > 4000) {
        // setMovementStatus("Stationary")
      }

    }, 1000)

    return () => clearInterval(t)

  }, [lastLocationChange])



  return (
    <View style={styles.root}>

      {/* header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>


      {/* status */}
      <ThemedView style={styles.statusBar}>

        <Text style={styles.statusLabel}>ALERT</Text>

        <Text style={styles.statusText}>
          Intruder last seen in {intruderLocation}
        </Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusSubText}>Intruder movement: </Text>
          <Text style={styles.movementValue}>{movementStatus}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusSubText}>Police status </Text>
          <Text style={styles.responseValue}>{responseStatus}</Text>
        </View>

      </ThemedView>


      <View style={styles.mainContent}>

        <View style={styles.mapWrapper}>
          <IntruderMap
            floorPlan={floorPlan}
            updateMode={updateMode}
            selectedCoords={selectedCoords ?? confirmedCoords}
            onMapPress={(coords) => {
              if (updateMode) {
                setSelectedCoords(coords)
              }
            }}
          />
        </View>


        {updateMode && (
          <Pressable
            style={[
              styles.confirmLocBtn,
              {
                backgroundColor: selectedCoords ? "#16A34A" : "#6B7280",
                opacity: selectedCoords ? 1 : 0.4,
              },
            ]}
            disabled={!selectedCoords}
            onPress={() => {
              if (selectedCoords) {
                setLabelModalOpen(true)
              }
            }}
          >
            <Text style={styles.policeText}>Confirm Location</Text>
          </Pressable>
        )}


        <View style={styles.actions}>

          <View style={styles.actionRow}>

            {!updateMode && (
              <Pressable
                style={styles.actionBtn}
                onPress={() => setChatOpen(true)}
              >
                <Text style={styles.actionText}>Chat</Text>
              </Pressable>
            )}

            {!updateMode && (
              <Pressable
                style={[styles.actionBtn, styles.actionBtnLive]}
                onPress={() => setFeedOpen(true)}
              >
                <Text style={styles.actionText}>Live Feed</Text>
              </Pressable>
            )}

          </View>


          {!updateMode && (
            <Pressable
              style={styles.policeBtn}
              onPress={() => setConfirmOpen(true)}
            >
              <Text style={styles.policeText}>Call Police</Text>
            </Pressable>
          )}


          {!updateMode && (
            <Pressable
              style={[
                styles.policeBtn,
                { backgroundColor: "#2563EB", marginTop: 10 },
              ]}
              onPress={() => {
                setUpdateMode(true)
                setSelectedCoords(null)
              }}
            >
              <Text style={styles.policeText}>Update Status</Text>
            </Pressable>
          )}

        </View>

      </View>


      {/* sheets */}
      <BottomSheet visible={chatOpen} onClose={() => setChatOpen(false)}>
        <ChatSheet />
      </BottomSheet>

      <BottomSheet visible={feedOpen} onClose={() => setFeedOpen(false)}>
        <LiveFeedSheet />
      </BottomSheet>

      <BottomSheet visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <PoliceConfirmation
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {

            setResponseStatus("Police notified")

            // log to chat
            addMessageToDb(
              "Mr Wallace",
              "Police have been notified"
            )

            setConfirmOpen(false)
          }}
        />
      </BottomSheet>


      {/* modal */}
      <Modal visible={labelModalOpen} transparent animationType="fade">

        <View style={styles.modalOverlay}>

          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              Enter Location of Intruder
            </Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Corridor, Sports Hall"
              placeholderTextColor="#999"
              value={locationLabel}
              onChangeText={(text) => {
                if (text.length <= 15) {
                  setLocationLabel(text)
                }
              }}
              maxLength={15}
            />

            <Pressable
              style={[
                styles.modalBtn,
                { backgroundColor: "#16A34A", marginTop: 15 },
              ]}
              onPress={() => {

                if (!locationLabel.trim() || !selectedCoords) return

                const coords = selectedCoords
                const label = locationLabel.trim()

                setConfirmedCoords(coords)
                setIntruderLocation(label)

                persistLocation(coords.x, coords.y, label)

                // log to chat instantly
                addMessageToDb(
                  "Mr Wallace",
                  `Updated intruder location to ${label}`
                )

                setMovementStatus("Manually Updated")
                setLastLocationChange(Date.now())

                setLabelModalOpen(false)
                setUpdateMode(false)
                setSelectedCoords(null)
                setLocationLabel("")

                setChatOpen(true)
              }}
            >
              <Text style={styles.modalBtnText}>Continue</Text>
            </Pressable>

          </View>

        </View>

      </Modal>

    </View>
  )
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F7FA" },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    elevation: 3,
  },

  logoImage: { width: 150, height: 50, marginLeft: -25 },

  statusBar: {
    marginTop: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    borderLeftWidth: 8,
    borderLeftColor: "#DC2626",
    alignItems: "center",
  },

  statusLabel: { color: "#FCA5A5", fontSize: 16, fontWeight: "700" },
  statusText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  statusRow: { flexDirection: "row", marginTop: 2 },
  statusSubText: { color: "#fff", fontSize: 15, fontWeight: "600" },

  movementValue: { color: "#FACC15", fontSize: 15 },
  responseValue: { color: "#60A5FA", fontSize: 15 },

  mainContent: { flex: 1, alignItems: "center", paddingBottom: 20 },

  mapWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },

  actions: { width: "92%" },

  actionRow: { flexDirection: "row", marginBottom: 10 },

  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#30497cff",
    alignItems: "center",
  },

  actionBtnLive: { backgroundColor: "#075b44ff" },

  actionText: { color: "#fff", fontWeight: "600" },

  policeBtn: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },

  confirmLocBtn: {
    width: "90%",
    paddingVertical: 15,
    marginVertical: 60,
    borderRadius: 12,
    alignItems: "center",
  },

  policeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "85%",
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  modalBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  modalBtnText: { color: "#fff", fontWeight: "600" },
})
