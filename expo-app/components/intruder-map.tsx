import React, { useState, useEffect } from "react";
import { ImageBackground, StyleSheet, View, Text } from "react-native";

// Simplified interface to resolve build errors in Leon's environment
interface IntruderMapProps {
  floorPlan: any;
}

export default function IntruderMap({ floorPlan }: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0.1, y: 0.1, label: "System Online" });

  useEffect(() => {
    let index = 0;
    const startLiveTracking = async () => {
      try {
        // Connects directly to the live backend hosted on CodeSandbox
        const response = await fetch('https://8k8sph-5000.csb.app/api/v1/intruder/path');
        if (!response.ok) throw new Error("Network response was not ok");
        
        const path = await response.json();

        // Sets up the interval to move the pin every 3 seconds for the demo
        const timer = setInterval(() => {
          if (index < path.length) {
            setCurrentPos(path[index]);
            index++;
          } else {
            index = 0; // Loop the simulation for the presentation
          }
        }, 3000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Connection Error to CodeSandbox:", error);
      }
    };

    startLiveTracking();
  }, []);

  return (
    <View 
      style={styles.container} 
      onLayout={(e) => setMapSize(e.nativeEvent.layout)}
    >
      <ImageBackground source={floorPlan} style={styles.map} resizeMode="contain">
        {mapSize.width > 0 && (
          <View 
            style={[styles.pin, {
              left: currentPos.x * mapSize.width,
              top: currentPos.y * mapSize.height,
            }]} 
          />
        )}
      </ImageBackground>
      
      {/* Dynamic status label providing context for the Live Feed */}
      <View style={styles.infoBox}>
        <Text style={styles.statusText}>STATUS: {currentPos.label}</Text>
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
    alignSelf: 'center', 
    overflow: 'hidden',
    marginTop: 15
  },
  map: { width: "100%", height: 450, opacity: 0.85 },
  infoBox: { 
    position: 'absolute', 
    top: 15, 
    left: 15, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    padding: 10, 
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444'
  },
  statusText: { 
    color: '#FF4444', 
    fontWeight: 'bold', 
    fontSize: 11,
    letterSpacing: 1
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
    elevation: 15
  },
});
