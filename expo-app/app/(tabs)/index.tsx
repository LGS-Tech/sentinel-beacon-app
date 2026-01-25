// Dashboard - MAIN FILE

import React, { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import ChatSheet from "@/components/chat";
import IntruderMap from "@/components/intruder-map";
import LiveFeedSheet from "@/components/live-feed";
import BottomSheet from "@/components/sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const floorPlan = require("../../assets/images/LGSFloorPlan_v1.png");
//TODO: floor plan will be behind ui but should be scrollable and clickable
export default function HomeScreen() {
  const status = "Intruder in corridor"; // TODO: replace with realtime API data
  //const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const positions = [
    { x: 100 / 800, y: 150 / 400 },
    { x: 170 / 800, y: 150 / 400 },
    { x: 170 / 800, y: 180 / 400 },
    { x: 500 / 800, y: 180 / 400 },
  ];

  //const [currentPos, setCurrentPos] = useState(positions[0]);
  const [chatOpen, setChatOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

  const handleChat = () => {
  console.log("Opening chat...");
  setChatOpen(true);
};

const handleFeed = () => {
  console.log("Opening live feed");
  setFeedOpen(true);
};

const handlePolice = () => {
  // probably should add confirmation modal here
  console.log("Calling police...");
};


  

  return (
    <View style={styles.root}>
      <ThemedView style={styles.statusBar}>
        <ThemedText style={styles.statusText}>Status: {status}</ThemedText>
      </ThemedView>

      <IntruderMap
        floorPlan={floorPlan}
        positions={positions}
        intervalMs={1500}
      />

      <View style={styles.actions}>
        <Pressable
          style={[styles.roundBtn, styles.chatPos]}
          onPress={handleChat}
        >
          <Text style={styles.btnText}>Chat</Text>
        </Pressable>

        <Pressable
          style={[styles.roundBtn, styles.feedBtn, styles.feedPos]}
          onPress={handleFeed}
        >
          <Text style={styles.btnText}>Live feed</Text>
        </Pressable>

        <Pressable
          style={[styles.policeBtn, styles.policeBtnPos]}
          onPress={handlePolice}
        >
          <Text style={styles.policeText}>Call police</Text>
        </Pressable>
      </View>

      {/* ✅ Bottom sheets go HERE */}
      <BottomSheet
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
      >
        <ChatSheet />
      </BottomSheet>

      <BottomSheet
        visible={feedOpen}
        onClose={() => setFeedOpen(false)}
      >
        <LiveFeedSheet />
      </BottomSheet>


    </View>

    
  );
}







const SIZE = 80;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F7FA", // light dashboard background
  },

  statusBar: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingVertical: 20,
    backgroundColor: "rgba(248,0,0,0.83)",
    alignItems: "center",
  },

  statusText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginTop: 16,
  },

  actions: {
    position: "absolute",
    bottom: 1,
    width: "100%",
    height: 190,
    justifyContent: "center",
    zIndex: 10,
    alignItems: "center",
  },
  roundBtn: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: "rgba(112,213,222,1)",
    alignItems: "center",
    justifyContent: "center",
  },

  feedBtn: {
    backgroundColor: "rgba(101,201,131,1)",
  },

  policeBtn: {
    position: "absolute",
    width: SIZE * 2,
    height: SIZE,
    borderRadius: 20,
    backgroundColor: "rgba(228,10,10,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  policeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 22,
  },

  policeBtnPos: {
    alignSelf: "center",
    bottom: 18,
  },

  chatPos: {
    bottom: 108,
    left: 28,
  },

  feedPos: {
    bottom: 108,
    right: 28,
  },

  intruderPin: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E53935",
    shadowColor: "#E53935",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  mapContainer: {
    marginTop: 120,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  map: {
    width: "100%",
    height: 460,
    borderRadius: 16,
  },
  
});


