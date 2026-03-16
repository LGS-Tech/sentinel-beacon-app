import { MaterialIcons } from "@expo/vector-icons"
import React from "react"
import { FlatList, Image, StyleSheet, Text, View } from "react-native"

export default function VaultFilesScreen({ route }: any) {

  // grab the selected subfolder from navigation params
  const params = route.params
  const subFolder = params.subFolder


  // render a single file entry
  const renderFileItem = ({ item }: any) => {

    const hasPreview = !!item.preview

    return (
      <View style={styles.row}>

        {hasPreview ? (
          <Image
            source={{ uri: item.preview }}
            style={styles.previewImage}
          />
        ) : (
          <MaterialIcons
            name="insert-drive-file"
            size={24}
            color="#aaa"
          />
        )}

        <View style={styles.meta}>
          <Text style={styles.fileName}>
            {item.name}
          </Text>
          <Text style={styles.fileDate}>
            {item.date}
          </Text>
        </View>

      </View>
    )
  }


  return (
    <View style={styles.screen}>

      <FlatList
        data={subFolder.files}
        renderItem={renderFileItem}
        keyExtractor={(file) => file.id}
      />

    </View>
  )
}


const styles = StyleSheet.create({

  screen: {
    flex: 1,
    backgroundColor: "#0c0c0c",
    padding: 20
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#1b1b1d"
  },

  previewImage: {
    width: 42,
    height: 42,
    borderRadius: 8
  },

  meta: {
    marginLeft: 12
  },

  fileName: {
    fontSize: 16,
    color: "white"
  },

  fileDate: {
    fontSize: 12,
    color: "#9b9b9b"
  }

})
