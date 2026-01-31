import ChatSheet from "@/components/chat";
import IntruderMap from "@/components/intruder-map";
import LiveFeedSheet from "@/components/live-feed";
import PoliceConfirmation from "@/components/police-confirmation";
import BottomSheet from "@/components/sheet";

import { ThemedView } from "@/components/themed-view";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const floorPlan = require("../../assets/images/LGSFloorPlan_v1.png");
const windowHeight = Dimensions.get("window").height;

export default function HomeScreen() {
  const [intruderLocation, setIntruderLocation] = useState("Classroom 1");
  const [movementStatus, setMovementStatus] = useState("Moving");
  const [responseStatus, setResponseStatus] = useState("Not notified");
  const [lastLocationChange, setLastLocationChange] = useState(Date.now());
  const status = {
    level: "ALERT",
    message: `Intruder last seen in ${intruderLocation}`,
  };

  const logo = require("../../assets/images/LGS-logo.png");
  const positions = [
    { x: 100 / 800, y: 150 / 400, label: "Classroom 1" },
    { x: 170 / 800, y: 150 / 400, label: "Classroom 2" },
    { x: 170 / 800, y: 180 / 400, label: "Corridor A" },
    { x: 500 / 800, y: 180 / 400, label: "Main Hall" },
  ];

  const [chatOpen, setChatOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  React.useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - lastLocationChange;
      if (diff > 4000) {
        setMovementStatus("Stationary");
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

      {/* Status */}
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

      {/* Main content: Map + Buttons */}
      <View style={styles.mainContent}>
        {/* Map */}
        <View style={styles.mapWrapper}>
          <IntruderMap
            floorPlan={floorPlan}
            positions={positions}
            intervalMs={1500}
            onLocationChange={(label) => {
              setIntruderLocation(label);
              setMovementStatus("Moving");
              setLastLocationChange(Date.now());
            }}
          />
        </View>

        {/* Buttons below map */}
        <View style={styles.actions}>
          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => setChatOpen(true)}
            >
              <Text style={styles.actionText}>Chat</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.actionBtnLive]}
              onPress={() => setFeedOpen(true)}
            >
              <Text style={styles.actionText}>Live Feed</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.policeBtn}
            onPress={() => setConfirmOpen(true)}
          >
            <Text style={styles.policeText}>Call Police</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom sheets */}
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
    paddingLeft: 0,
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  logoImage: {
    width: 150,
    height: 50,
    marginLeft: -25,
  },

  statusBar: {
    marginTop: 30,
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
    paddingTop: 10,
  },

  actions: {
    width: "92%",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  actionBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  actionBtnLive: {
    backgroundColor: "#064E3B",
  },

  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  policeBtn: {
    marginTop: 6,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  policeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
  },
});
