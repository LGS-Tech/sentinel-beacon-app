import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import React from "react"
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated"

import { vaultFolders } from "@/components/vaultdata/vault-data"


// individual folder tile
function FolderCard({ item }: any) {

  // simple press animation
  const scaleValue = useSharedValue(1)

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }]
    }
  })

  const handlePress = () => {
    router.push({
      pathname: "/vault-folder",
      params: { folderId: item.id }
    })
  }


  return (
    <Animated.View style={[styles.folderCard, scaleStyle]}>

      <Pressable
        style={styles.cardInner}
        onPressIn={() => {
          scaleValue.value = withSpring(0.96)
        }}
        onPressOut={() => {
          scaleValue.value = withSpring(1)
        }}
        onPress={handlePress}
      >

        <MaterialIcons name="folder" size={34} color="#FFD166" />

        <Text style={styles.folderLabel}>
          {item.name}
        </Text>

      </Pressable>

    </Animated.View>
  )
}


export default function VaultScreen() {

  return (
    <View style={styles.screen}>

      {/* top title */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Vault</Text>
        <MaterialIcons name="lock" size={20} color="#343434ff" />
      </View>

      <FlatList
        data={vaultFolders}
        numColumns={2}
        keyExtractor={(folder) => folder.id}
        renderItem={({ item }) => <FolderCard item={item} />}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listPadding}
      />

    </View>
  )
}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: "#f2f2f2ff"
  },

  topBar: {
    paddingTop: 60,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6
  },



  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "black"
  },

  row: {
    justifyContent:  "space-between"
  },

  listPadding: {
    padding: 18
  },

  folderCard: {
    width: "48%",
    height: 110,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: "#ffffffff"
  },

  cardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  folderLabel: {
    marginTop: 8,
    fontSize: 15 ,
    color: "black"
  }

})
