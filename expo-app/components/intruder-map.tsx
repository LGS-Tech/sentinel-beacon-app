// will render the floor plan and take care of pin drop generating

import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

type Position = {
  x: number; // normalized (0–1)
  y: number; // normalized (0–1)
};

type IntruderMapProps = {
  floorPlan: any;
  positions: Position[];
  intervalMs?: number;
};

export default function IntruderMap({
  floorPlan,
  positions,
  intervalMs = 1500,
}: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState<Position>(positions[0]);

  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setCurrentPos(positions[index]);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [positions, intervalMs]);

  return (
    <View
      style={styles.mapContainer}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setMapSize({ width, height });
      }}
    >
      <ImageBackground
        source={floorPlan}
        style={styles.map}
        resizeMode="contain"
      >
        {mapSize.width > 0 && (
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
