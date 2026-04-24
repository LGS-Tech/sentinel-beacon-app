import React, { useRef, useState } from "react"
import {
  Image,
  NativeSyntheticEvent,
  NativeTouchEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native"

type Coords = {
  x: number
  y: number
}

type Props = {
  floorPlan: any
  updateMode: boolean
  showMarker: boolean
  selectedCoords: Coords
  onMapPress: (coords: Coords) => void
}

export default function IntruderMap({
  floorPlan,
  updateMode,
  showMarker, 
  selectedCoords,
  onMapPress,
}: Props) {

  const [layout, setLayout] = useState({ width: 1, height: 1 })

  const startTouch = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    startTouch.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    }
  }

  const onTouchEnd = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (!startTouch.current || !updateMode) return

    const dx = Math.abs(e.nativeEvent.pageX - startTouch.current.x)
    const dy = Math.abs(e.nativeEvent.pageY - startTouch.current.y)

    // treat as tap only if finger barely moved
    if (dx > 10 || dy > 10) return

    const { locationX, locationY } = e.nativeEvent

    const x = locationX / layout.width
    const y = locationY / layout.height

    onMapPress({ x, y })
  }

  return (
    <ScrollView
      style={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      maximumZoomScale={2}
      minimumZoomScale={1}
      contentContainerStyle={styles.content}
    >

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        maximumZoomScale={2}
        minimumZoomScale={1}
        contentContainerStyle={styles.content}
      >

        <View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            setLayout({ width, height })
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >

          <Image
            source={floorPlan}
            style={styles.image}
            resizeMode="contain"
          />

          {showMarker && (
  <View
    pointerEvents="none"
    style={[
      styles.marker,
      {
        left: `${selectedCoords.x * 100}%`,
        top: `${selectedCoords.y * 100}%`,
      },
    ]}
  />
)}

        </View>

      </ScrollView>

    </ScrollView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    width: 1200,  
    height: 1600,  
  },

  image: {
    width: 1000,
    height: 1300,
  },

  marker: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: "red",
    borderWidth: 3,     
    borderColor: "#faa4a4",  // bit of outlining to increase visibility
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },

})
