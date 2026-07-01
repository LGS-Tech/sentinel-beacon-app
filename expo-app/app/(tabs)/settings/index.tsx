import { MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React from "react"
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"

const sections = [
  {
    title: "Account",
    data: [
      { id: "1", label: "Profile", route: "/settings/profile" },
      { id: "2", label: "Change Password", route: "/settings/change-password" },
      { id: "3", label: "Sign Out", route: "/settings/sign-out" }
    ]
  },
  {
    title: "Appearance",
    data: [
      { id: "4", label: "Theme", route: "/settings/theme" },
      { id: "5", label: "Text Size", route: "/settings/text-size" }
    ]
  },
  {
    title: "Data",
    data: [
      { id: "6", label: "Storage Usage", route: "/settings/storage" },
      { id: "7", label: "Clear Cache", route: "/settings/cache" }
    ]
  },
  {
    title: "About",
    data: [
      { id: "8", label: "App Version", route: "/settings/version" },
      { id: "9", label: "Privacy Policy", route: "/settings/privacy" }
    ]
  },
  {
    title: "Login page test",
    data: [
      { id: "dev1", label: "Open Login Screen", route: "/login-page" }
    ]
  }
]

export default function SettingsScreen() {
  const router = useRouter();
  
  const renderItem = ({ item }: any) => {
    return (
      <Pressable 
        style={styles.row} 
        onPress={() => item.route && router.push(item.route)}
      >
        <Text style={styles.label}>{item.label}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#999" />
      </Pressable>
    )
  }

  const renderSection = ({ item }: any) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <View style={styles.sectionBox}>
          {item.data.map((setting: any) => (
            <View key={setting.id}>
              {renderItem({ item: setting })}
            </View>
          ))}
        </View>
      </View>
    )
  }

  // Caminho do logo ajustado para o nível correto da subpasta
  const logo = require("../../../assets/images/LGS-logo.png");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <FlatList
        data={sections}
        keyExtractor={(section) => section.title}
        renderItem={renderSection}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
    elevation: 3,
  },
  logoImage: { width: 150, height: 50, marginLeft: -25 },
  list: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, color: "#666", marginBottom: 6, marginLeft: 4 },
  sectionBox: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 15, color: "#222" }
});
