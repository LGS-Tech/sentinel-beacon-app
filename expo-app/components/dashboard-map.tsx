import React from "react"
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native"



type CaseMarker = {
  id: number
  title: string
  locationX: number
  locationY: number
}


type Props = {
    cases: any[]
    selectedCase: any
    onMarkerPress: (item:any)=>void
    onView: (item:any)=>void
}




export default function DashboardMap({
  cases,
  selectedCase,
  onMarkerPress,
  onView,
}: Props) {

  //const [cases, setCases] = useState<any[]>([])
  //const [selectedCase, setSelectedCase] = useState<any | null>(null)

  const floorPlan = require("../assets/images/LGSUniFloorPlan.png")


  

  


// need to have marker be centered on screen when clicked

  function getMarkerColour(title: string) {

    if (title.startsWith("Fire")) {
      return  "#DC2626"
    }


    if (title.startsWith("Intruder")) {
      return "#F97316"
    }

    if (title.startsWith("Injury")) {
      return "#16A34A"
    }

    if (title.startsWith("Maintenance")) {
      return "#2563EB"
    }

    return  "#6B7280"

  }

  return (

  <View style={styles.screen}>

    <View
      style={styles.legend}
      pointerEvents="none"
    >

      <Text style={styles.legendTitle}>
        Active Cases
      </Text>

      <View style={styles.legendRow}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#2563EB" },
          ]}
        />
        <Text>Maintenance</Text>
      </View>

      <View style={styles.legendRow}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#DC2626" },
          ]}
        />
        <Text>Fire</Text>
      </View>

      <View style={styles.legendRow}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#F97316" },
          ]}
        />
        <Text>Intruder</Text>
      </View>

      <View style={styles.legendRow}>
        <View
          style={[
            styles.legendDot,
            { backgroundColor: "#16A34A" },
          ]}
        />
        <Text>Injury</Text>
      </View>

    </View>

    <ScrollView
      style={styles.container}
      horizontal
      maximumZoomScale={2}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >

      <ScrollView
        maximumZoomScale={2}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <View>

          <Image
            source={floorPlan}
            style={styles.image}
            resizeMode="contain"
          />

          {cases.map((item) => (

        <View
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.locationX * 100}%`,
            top: `${item.locationY * 100}%`,
            transform: [
              { translateX: -13 },
              { translateY: -13 },
            ],
            alignItems: "center",
          }}
        >

    

          <Pressable
            onPress={() =>
              onMarkerPress(
                selectedCase?.id === item.id
                ? null
                : item
              )
            }
            style={[
              styles.marker,
              {
               backgroundColor: getMarkerColour(item.title),
              },
            ]}
          >

          <View style={styles.markerGlow} />

          </Pressable>

        </View>

        ))}

        </View>

      </ScrollView>

    </ScrollView>

    

  </View>

)


}

const styles = StyleSheet.create({

  container: {
    flex: 1 ,
  },



  content: {
    width: 1525,
    height: 959,
  },

  image: {
    width: 1525,
    height: 959,
  },

  marker: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    transform: [
      { translateX: -13 },
      { translateY: -13 },
    ],
  },

  markerText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  legend: {
  position: "absolute",
  top: 38,
  left: 8,

  backgroundColor: " #F5F5F5",

  paddingVertical: 16,
  paddingHorizontal: 18,

  borderRadius: 16,

  borderWidth: 1,
  borderColor: "#D6D6D6",

  zIndex: 999,

  elevation: 8,
},

  legendTitle: {
  fontSize: 19,
  fontWeight: "700",
  marginBottom: 12,
},

  legendRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

legendDot: {
  width: 18,
  height: 18,
  borderRadius: 9,
  marginRight: 10,
},

markerGlow: {
  position: "absolute",

  width: 42,
  height: 42,

  borderRadius: 21,

  backgroundColor: "rgba(255,255,255,0.25)",
},

tooltip: {
  marginBottom: 8,

  backgroundColor: "#FFFFFF",

  paddingHorizontal: 10,
  paddingVertical: 6,

  borderRadius: 8,

  borderWidth: 1,
  borderColor: "#D0D0D0",

  elevation: 4,
},

tooltipText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#222",
},





screen: {
  flex: 1,
},


closeButton: {
    position: "absolute",

    right: 18,
    top: 18,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor:  "#ECECEC",

    justifyContent: "center",
    alignItems: "center",
},

closeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#555",
},






}

)