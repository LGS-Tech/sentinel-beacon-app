// will render the floor plan and take care of pin drop generating

import React, { useEffect, useState } from "react";
import { Dimensions, ImageBackground, StyleSheet, View } from "react-native";
type Position = {
  x: number;
  y: number;
  label: string;
};

type IntruderMapProps = {
  floorPlan: any;
  positions: Position[];
  intervalMs?: number;
  onLocationChange?: (label: string) => void;
};

export default function IntruderMap({
  floorPlan,
  positions,
  intervalMs = 1500,
  onLocationChange,
}: IntruderMapProps) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentPos, setCurrentPos] = useState<Position>(positions[0]);
  const windowHeight = Dimensions.get("window").height;
  useEffect(() => {
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setCurrentPos(positions[index]);

      if (onLocationChange) {
        onLocationChange(positions[index].label);
      }
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
    width: "92%",
    height: 460,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
    marginTop: 10,
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
