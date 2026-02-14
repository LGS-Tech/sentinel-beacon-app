import ChatSheet from "@/components/chat";
import IntruderMap from "@/components/intruder-map";
import LiveFeedSheet from "@/components/live-feed";
import PoliceConfirmation from "@/components/police-confirmation";
import BottomSheet from "@/components/sheet";

import { ThemedView } from "@/components/themed-view";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const floorPlan = require("../../assets/images/LGSFloorPlan_v3.png");
const windowHeight = Dimensions.get("window").height;

/**
 * Default starting position:
 * Bottom of Sports Hall (based on your previous mock values)
 */
const DEFAULT_COORDS = { x: 0.52, y: 0.79 };
const DEFAULT_LABEL = "Bottom of Sports Hall";

export default function HomeScreen() {
  const [intruderLocation, setIntruderLocation] = useState(DEFAULT_LABEL);
  const [movementStatus, setMovementStatus] = useState("Stationary");
  const [responseStatus, setResponseStatus] = useState("Notified");
  const [lastLocationChange, setLastLocationChange] = useState(Date.now());

  // Confirmed persistent pin
  const [confirmedCoords, setConfirmedCoords] =
    useState<{ x: number; y: number }>(DEFAULT_COORDS);

  // Update flow state
  const [updateMode, setUpdateMode] = useState(false);
  const [selectedCoords, setSelectedCoords] =
    useState<{ x: number; y: number } | null>(null);
  const [labelModalOpen, setLabelModalOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");

  const logo = require("../../assets/images/LGS-logo.png");

  const [chatOpen, setChatOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Auto movement decay
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - lastLocationChange;
      if (diff > 4000) {
        //setMovementStatus("Stationary");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastLocationChange]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      {/* Status Bar */}
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

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.mapWrapper}>
          <IntruderMap
            floorPlan={floorPlan}
            updateMode={updateMode}
            selectedCoords={selectedCoords ?? confirmedCoords}
            onMapPress={(coords) => {
              if (updateMode) {
                setSelectedCoords(coords);
              }
            }}
          />
        </View>

        {/* confirm button after teacher updated  location */}
        {updateMode && (
          <Pressable
            style={[
              styles.confirmLocBtn,
              {
                backgroundColor: selectedCoords ? "#16A34A" : "#6B7280",
                marginBottom: 10,
                opacity: selectedCoords ? 1 : 0.4,
              },
            ]}
            disabled={!selectedCoords}
            onPress={() => {
              if (selectedCoords) {
                setLabelModalOpen(true);
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
                setUpdateMode(true);
                setSelectedCoords(null);
              }}
            >
              <Text style={styles.policeText}>Update Status</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Bottom Sheets */}
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
            setResponseStatus("Police notified");
            setConfirmOpen(false);
          }}
        />
      </BottomSheet>

      {/* Label Modal */}
      <Modal visible={labelModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Location of Intruder</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Corridor, Sports Hall, Rear Entrance"
              placeholderTextColor="#999"
              value={locationLabel}
              onChangeText={(text) => {
                if (text.length <= 15) {
                  setLocationLabel(text);
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
                if (!locationLabel.trim() || !selectedCoords) return;

                // Persist confirmed location
                setConfirmedCoords(selectedCoords);
                setIntruderLocation(locationLabel.trim());
                setMovementStatus("Manually Updated");
                setLastLocationChange(Date.now());

                // Reset update mode
                setLabelModalOpen(false);
                setUpdateMode(false);
                setSelectedCoords(null);
                setLocationLabel("");

                // Prompt for specifics
                setChatOpen(true);
              }}
            >
              <Text style={styles.modalBtnText}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    elevation: 3,
  },

  logoImage: {
    width: 150,
    height: 50,
    marginLeft: -25,
  },

  statusBar: {
    marginTop: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    borderLeftWidth: 8,
    borderLeftColor: "#DC2626",
    minWidth: "85%",
    alignSelf: "center",
    alignItems: "center",
  },

  statusLabel: {
    color: "#FCA5A5",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  statusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  statusSubText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  movementValue: {
    color: "#FACC15",
    fontSize: 15,
    fontWeight: "600",
  },

  responseValue: {
    color: "#60A5FA",
    fontSize: 15,
    fontWeight: "600",
  },

  mainContent: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },

  mapWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  actions: {
    width: "92%",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#30497cff",
    alignItems: "center",
  },

  actionBtnLive: {
    backgroundColor: "#075b44ff",
  },

  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  policeBtn: {
    width: "100%",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmLocBtn: {
    width: "90%",
    paddingVertical: 15,
    marginVertical: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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

  modalBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
