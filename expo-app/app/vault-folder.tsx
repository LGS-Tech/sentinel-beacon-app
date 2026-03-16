import { VaultFile, vaultFolders, VaultFolder as VaultFolderType } from "@/components/vaultdata/vault-data"
import { MaterialIcons } from "@expo/vector-icons"
import { Stack, useLocalSearchParams } from "expo-router"
import { FlatList, StyleSheet, Text, View } from "react-native"

export default function VaultFolder() {

  // pull the id from the route params
  const params = useLocalSearchParams()
  const folderId = params.folderId

  // locate the matching folder from our dataset
  const folder: VaultFolderType | undefined =
    vaultFolders.find((f) => f.id === folderId)

  // guard in case the folder doesn't exist
  if (!folder) {
    return <Text style={styles.notFound}>Folder not found</Text>
  }

  /**
   * collect every  file across subfolders.
   * we also attach the subfolder name to each file
   * in case we want to display it later.
   */
  const files: (VaultFile & { subFolderName: string })[] = []

  folder.subFolders.forEach((sub) => {
    sub.files.forEach((file) => {
      files.push({
        ...file,
        subFolderName: sub.name
      })
    })
  })

  return (
    <>
      {/* set the screen title dynamically */}
      <Stack.Screen options={{ title: folder.name }} />

      <FlatList
        data={files}
        keyExtractor={(file) => file.id}
        numColumns={2}
        contentContainerStyle={styles.container}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          return (
            <View style={styles.card}>

              {/* simple placeholder icon instead of previews */}
              <View style={styles.iconBox}>
                <MaterialIcons name="description" size={32} color="#555" />
              </View>

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.date}>{item.date}</Text>

            </View>
          )
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({

  container: {
    padding: 16
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 16
  },

  card: {
    width: "48%",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },

  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center"
  },

  name: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center"
  },

  date: {
    fontSize: 12,
    color: "#666",
    textAlign: "center"
  },

  notFound: {
    flex: 1,
    marginTop: 50,
    fontSize: 18,
    textAlign: "center"
  }

})
