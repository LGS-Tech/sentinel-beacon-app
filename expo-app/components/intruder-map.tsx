import React, { useState } from "react";
import { ImageBackground, StyleSheet, View, TouchableOpacity, GestureResponderEvent } from "react-native";

type Position = {
  x: number; // Normalized coordinate (0 to 1)
  y: number; // Normalized coordinate (0 to 1)
  label: string;
};

type IntruderMapProps = {
  floorPlan: any;
  onLocationChange?: (label: string) => void;
};

export default function IntruderMap({
  floorPlan,
  onLocationChange,
}: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState<Position | null>(null);

  // Main Function: Captures touch events and syncs with CodeSandbox Backend
  const handleMapClick = async (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    // COORDINATE NORMALIZATION: Ensures the pin stays in the correct 
    // relative spot on any device screen (iPad, iPhone, etc.)
    const normalizedX = locationX / mapSize.width;
    const normalizedY = locationY / mapSize.height;

    const newLabel = "Intruder Detected";
    setCurrentPos({ x: normalizedX, y: normalizedY, label: newLabel });

    if (onLocationChange) onLocationChange(newLabel);

    try {
      // LINKED TO YOUR LIVE CODESANDBOX BACKEND
      const response = await fetch('https://8k8sph-5000.csb.app/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: normalizedX,
          y: normalizedY,
          label: newLabel
        }),
      });

      if (!response.ok) throw new Error("Backend sync failed");
      console.log("Success: Strategic alert synced to CodeSandbox");
    } catch (error) {
      console.error("Integration Error:", error);
    }
  };

  return (
    <View
      style={styles.mapContainer}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setMapSize({ width, height });
      }}
    >
      {/* TOUCHABLE LAYER: Captures clicks for real-time reporting */}
      <TouchableOpacity activeOpacity={1} onPress={handleMapClick} style={{ flex: 1 }}>
        <ImageBackground source={floorPlan} style={styles.map} resizeMode="contain">
          {mapSize.width > 0 && currentPos && (
            <View
              style={[
                styles.intruderPin,
                {
                  left: currentPos.x * mapSize.width,
                  top: currentPos.y * mapSize.height,
                },
              ]}
            />
          )}
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { 
    width: "92%", 
    height: 460, 
    borderRadius: 16, 
    backgroundColor: "#FFF", 
    overflow: "hidden", 
    marginTop: 10 
  },
  map: { width: "100%", height: 460 },
  intruderPin: {
    position: "absolute",
    width: 20, 
    height: 20, 
    borderRadius: 10,
    backgroundColor: "#E53935",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginLeft: -10, 
    marginTop: -10, // Centers the pin directly on the touch coordinate
    shadowColor: "#E53935", 
    shadowOpacity: 0.9, 
    shadowRadius: 12, 
    elevation: 10
  },
});
