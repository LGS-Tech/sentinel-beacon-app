import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

// using mock data atm but to be replaced with actual pin drops and manual status updates
interface IntruderMapProps {
  floorPlan: any;
}

// Mocked intruder movement path (normalized coordinates)
const MOCK_SIM = [
  { x: 0.22, y: 0.17, label: "Movement Detected" },
  { x: 0.22, y: 0.28, label: "Intruder outside C1" },
  { x: 0.46, y: 0.49, label: "Intruder outside Sports Hall" },
  { x: 0.62, y: 0.48, label: "Police notified" },
  { x: 0.52, y: 0.79, label: "Intruder at the bottom of Sports Hall" },
];

export default function IntruderMap({ floorPlan }: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState(MOCK_SIM[0]);

  useEffect(() => {
    let index = 0;

    const timer = setInterval(() => {
      index = (index + 1) % MOCK_SIM.length;
      setCurrentPos(MOCK_SIM[index]);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setMapSize(e.nativeEvent.layout)}
    >
      <ImageBackground
        source={floorPlan}
        style={styles.map}
        resizeMode="contain"
      >
        {mapSize.width > 0 && (
          <View
            style={[
              styles.pin,
              {
                left: currentPos.x * mapSize.width,
                top: currentPos.y * mapSize.height,
              },
            ]}
          />
        )}
      </ImageBackground>

      {/* Dynamic status label providing context for the Live Feed */}
      <View style={styles.infoBox}>
        <Text style={styles.statusText}>
          STATUS: {currentPos.label}
        </Text>
      </View>
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
  infoBox: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FF4444",
  },
  statusText: {
    color: "#FF4444",
    fontWeight: "bold",
    fontSize: 11,
    letterSpacing: 1,
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
    shadowColor: "#FF4444",
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
});
