import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface IntruderMapProps {
  floorPlan: any;
  updateMode?: boolean;
  selectedCoords?: { x: number; y: number } | null;
  onMapPress?: (coords: { x: number; y: number }) => void;
}

export default function IntruderMap({
  floorPlan,
  updateMode,
  selectedCoords,
  onMapPress,
}: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const handlePress = (event: any) => {
    if (!updateMode || !mapSize.width) return;

    const { locationX, locationY } = event.nativeEvent;

    const normalized = {
      x: locationX / mapSize.width,
      y: locationY / mapSize.height,
    };

    onMapPress?.(normalized);
  };

  return (
    <View
      style={styles.container}
      onLayout={(e) => setMapSize(e.nativeEvent.layout)}
    >
      <Pressable style={{ flex: 1 }} onPress={handlePress}>
        <ImageBackground
          source={floorPlan}
          style={styles.map}
          resizeMode="contain"
        >
          {selectedCoords && (
            <View
              style={[
                styles.pin,
                {
                  left: selectedCoords.x * mapSize.width,
                  top: selectedCoords.y * mapSize.height,
                },
              ]}
            />
          )}
        </ImageBackground>
      </Pressable>

      {updateMode && (
        <View style={styles.updateBanner}>
          <Text style={styles.updateText}>
            Tap map to mark intruder location
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    height: 450,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    alignSelf: "center",
    overflow: "hidden",
    marginTop: 15,
  },
  map: {
    width: "100%",
    height: 450,
    opacity: 0.85,
  },
  pin: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF4444",
    borderWidth: 4,
    borderColor: "white",
    marginLeft: -12,
    marginTop: -12,
  },
  updateBanner: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 10,
  },
  updateText: {
    color: "#FF4444",
    fontWeight: "bold",
    fontSize: 12,
  },
});
