import ChatSheet, { addMessageToDb, clearMessages } from "@/components/chat"
import IntruderMap from "@/components/intruder-map"
import LiveFeedSheet from "@/components/live-feed"
import PoliceConfirmation from "@/components/police-confirmation"
import BottomSheet from "@/components/sheet"
import { ThemedView } from "@/components/themed-view"

import React, { useEffect, useState } from "react"
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

import CaseClosedSheet from "@/components/close-sheet"
import * as SQLite from "expo-sqlite"

// simple local db, nothing fancy
const db = SQLite.openDatabaseSync("app.db")

// assets
const floorPlan = require("../../assets/images/LGSFloorPlan_v3.png")
const logo = require("../../assets/images/LGS-logo.png")

// fallback coords so marker isn't null on first load
const DEFAULT_COORDS = { x: 0.52, y: 0.79 }

type SavedLocation = {
  id: number
  x: number
  y: number
  label: string
}

// initialise table if it doesn't exist yet
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

// always storing a single row (id = 1), just overwriting
const persistLocation = (x: number, y: number, label: string) => {
  db.runSync(
    "INSERT OR REPLACE INTO intruder_location (id, x, y, label) VALUES (1, ?, ?, ?)",
    [x, y, label]
  )
}

export default function HomeScreen() {

  // core state
  const [caseActive, setCaseActive] = useState(false)
  const [caseClosedOpen, setCaseClosedOpen] = useState(false)

  // status stuff
  const [intruderLocation, setIntruderLocation] = useState("")
  const [movementStatus] = useState("Stationary") // not dynamic yet
  const [responseStatus, setResponseStatus] = useState("Notified")

  // coords handling
  const [confirmedCoords, setConfirmedCoords] = useState(DEFAULT_COORDS)
  const [updateMode, setUpdateMode] = useState(false)
  const [selectedCoords, setSelectedCoords] = useState<null | { x: number; y: number }>(null)

  // modal + input
  const [labelModalOpen, setLabelModalOpen] = useState(false)
  const [locationLabel, setLocationLabel] = useState("")

  // sheets
  const [chatOpen, setChatOpen] = useState(false)
  const [feedOpen, setFeedOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // bottom actions
  const [actionsExpanded, setActionsExpanded] = useState(false)

  // hacky but effective way to force map refresh
  const [mapKey, setMapKey] = useState(0)

  useEffect(() => {
    setupDb()
  }, [])

  const startCase = () => {
    clearMessages()
    setCaseActive(true)
    setUpdateMode(true)

    addMessageToDb("Mr Wallace", "Started a new case")
  }

  const closeCase = () => {
    Alert.alert(
      "Close Case",
      "Are you sure you want to close this case?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {

            // reset basically everything
            setCaseActive(false)
            setUpdateMode(false)
            setSelectedCoords(null)
            setIntruderLocation("")
            setLocationLabel("")

            addMessageToDb("Mr Wallace", "Closed the case")

            setCaseClosedOpen(true)
          },
        },
      ]
    )
  }

  return (
    <View style={styles.root}>

      {/* header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* status bar */}
      <ThemedView style={styles.statusBar}>
        <Text style={styles.statusLabel}>ALERT</Text>

        {!caseActive ? (
          <Text style={styles.statusText}>
            No current developments
          </Text>
        ) : (
          <>
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
          </>
        )}
      </ThemedView>

      <View style={styles.mainContent}>

        {/* map */}
        <View style={styles.mapWrapper}>
          <IntruderMap
            key={mapKey}
            floorPlan={floorPlan}
            updateMode={updateMode}
            selectedCoords={selectedCoords ?? confirmedCoords}
            showMarker={caseActive}
            onMapPress={(coords) => {
              if (updateMode) setSelectedCoords(coords)
            }}
          />
        </View>

        {/* confirm location button only in update mode */}
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
              if (selectedCoords) setLabelModalOpen(true)
            }}
          >
            <Text style={styles.policeText}>Confirm Location</Text>
          </Pressable>
        )}

        {/* bottom actions */}
        <View style={styles.actionsContainer}>

          {!caseActive && (
            <View style={{ width: "92%" }}>
              <Pressable style={styles.policeBtn} onPress={startCase}>
                <Text style={styles.policeText}>Start Case</Text>
              </Pressable>
            </View>
          )}

          {caseActive && !updateMode && (
            <>
              {/* little drag handle style toggle */}
              <Pressable
                style={styles.sheetHandle}
                onPress={() => setActionsExpanded(prev => !prev)}
              >
                <View style={styles.handleBar} />
                <Text style={styles.handleText}>
                  {actionsExpanded ? "Hide Actions" : "Show Actions"}
                </Text>
              </Pressable>

              {actionsExpanded && (
                <View style={styles.actions}>

                  <View style={styles.actionRow}>
                    <Pressable style={styles.actionBtn} onPress={() => setChatOpen(true)}>
                      <Text style={styles.actionText}>Chat</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.actionBtn, styles.actionBtnLive]}
                      onPress={() => setFeedOpen(true)}
                    >
                      <Text style={styles.actionText}>Live Feed</Text>
                    </Pressable>
                  </View>

                  <Pressable style={styles.policeBtn} onPress={() => setConfirmOpen(true)}>
                    <Text style={styles.policeText}>Call Police</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.policeBtn, { backgroundColor: "#2563EB", marginTop: 10 }]}
                    onPress={() => {
                      setUpdateMode(true)
                      setSelectedCoords(null) // force reselect
                    }}
                  >
                    <Text style={styles.policeText}>Update Status</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.policeBtn, { backgroundColor: "#6B7280", marginTop: 10 }]}
                    onPress={closeCase}
                  >
                    <Text style={styles.policeText}>Close Case</Text>
                  </Pressable>

                </View>
              )}
            </>
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

            addMessageToDb(
              "Mr Wallace",
              "Police have been notified"
            )

            setConfirmOpen(false)
          }}
        />
      </BottomSheet>

      <BottomSheet visible={caseClosedOpen} onClose={() => setCaseClosedOpen(false)}>
        <CaseClosedSheet onClose={() => setCaseClosedOpen(false)} />
      </BottomSheet>

      {/* location label modal */}
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
                // quick length guard
                if (text.length <= 15) setLocationLabel(text)
              }}
              maxLength={15}
            />

            <Pressable
              style={[styles.modalBtn, { backgroundColor: "#16A34A", marginTop: 15 }]}
              onPress={() => {

                if (!locationLabel.trim() || !selectedCoords) return

                const coords = selectedCoords
                const label = locationLabel.trim()

                setConfirmedCoords(coords)
                setIntruderLocation(label)

                persistLocation(coords.x, coords.y, label)

                addMessageToDb(
                  "Mr Wallace",
                  `Updated intruder location to ${label}`
                )

                // force map rerender so marker updates cleanly
                setMapKey(prev => prev + 1)

                // reset temp state
                setUpdateMode(false)
                setSelectedCoords(null)
                setLocationLabel("")
                setLabelModalOpen(false)

                // jump straight into chat after update
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
  },

  actionsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },

  sheetHandle: {
    width: "100%",
    backgroundColor: "#1F2937",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "center",
    paddingVertical: 8,
  },

  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#6B7280",
    marginBottom: 6,
  },

  handleText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "600",
  },

  actions: {
    width: "100%",
    backgroundColor: "#111827",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#374151",
  },

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
