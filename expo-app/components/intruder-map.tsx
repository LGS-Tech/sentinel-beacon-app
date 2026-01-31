// FINAL INTEGRATED VERSION - COORDINATION LOGIC
import React, { useState } from "react";
import { Dimensions, ImageBackground, StyleSheet, View, TouchableOpacity, GestureResponderEvent, Alert } from "react-native";

type Position = {
  x: number;
  y: number;
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

  // MAIN FUNCTION: Captures the touch and sends it to the Backend
  const handleMapClick = async (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;

    // NORMALIZATION: Converting pixel clicks to 0.0 - 1.0 range
    // This ensures pins stay in the same spot on any screen size.
    const normalizedX = locationX / mapSize.width;
    const normalizedY = locationY / mapSize.height;

    const newLabel = "Intruder Detected";
    setCurrentPos({ x: normalizedX, y: normalizedY, label: newLabel });

    if (onLocationChange) onLocationChange(newLabel);

    try {
      // NOTE: Replace 'YOUR_IPAD_IP' with your actual local IP (e.g., 192.168.1.15)
      const response = await fetch('http://YOUR_IPAD_IP:5000/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: normalizedX,
          y: normalizedY,
          label: newLabel
        }),
      });

      if (!response.ok) throw new Error("Backend sync failed");
      console.log("Success: Alert synced to DB");
    } catch (error) {
      console.error("Sync Error:", error);
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
      {/* TOUCHABLE LAYER: Makes the whole map clickable */}
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
  mapContainer: { width: "92%", height: 460, borderRadius: 16, backgroundColor: "#FFF", overflow: "hidden", marginTop: 10 },
  map: { width: "100%", height: 460 },
  intruderPin: {
    position: "absolute",
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: "#E53935",
    marginLeft: -8, marginTop: -8, // Centers the pin exactly on the touch point
    shadowColor: "#E53935", shadowOpacity: 0.8, shadowRadius: 10, elevation: 10
  },
});
