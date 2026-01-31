import React, { useState, useEffect } from "react";
import { ImageBackground, StyleSheet, View, Text } from "react-native";

export default function IntruderMap({ floorPlan }) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0.1, y: 0.1, label: "Initializing..." });

  useEffect(() => {
    let index = 0;
    const startLiveTracking = async () => {
      try {
        // Connects to your live CodeSandbox
        const response = await fetch('https://8k8sph-5000.csb.app/api/v1/intruder/path');
        const path = await response.json();

        const timer = setInterval(() => {
          if (index < path.length) {
            setCurrentPos(path[index]);
            index++;
          } else {
            index = 0; // Loops for the demo presentation
          }
        }, 3000); // Moves the pin every 3 seconds

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };

    startLiveTracking();
  }, []);

  return (
    <View style={styles.mapContainer} onLayout={(e) => setMapSize(e.nativeEvent.layout)}>
      <ImageBackground source={floorPlan} style={styles.map} resizeMode="contain">
        {mapSize.width > 0 && (
          <View style={[styles.intruderPin, {
              left: currentPos.x * mapSize.width,
              top: currentPos.y * mapSize.height,
            }]} 
          />
        )}
      </ImageBackground>
      {/* Dynamic Status Label for Hanae's Feed logic */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{currentPos.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: { width: "94%", height: 460, borderRadius: 20, backgroundColor: "#000", overflow: "hidden", alignSelf: 'center' },
  map: { width: "100%", height: 460, opacity: 0.8 },
  statusBox: { position: 'absolute', bottom: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8 },
  statusText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 12 },
  intruderPin: {
    position: "absolute",
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#FF3B30",
    borderWidth: 3, borderColor: "white",
    marginLeft: -12, marginTop: -12,
    shadowColor: "#FF3B30", shadowOpacity: 1, shadowRadius: 15, elevation: 15
  },
});
