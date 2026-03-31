import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Isso garante que o título apareça no Header do Stack que vimos no seu _layout */}
      <Stack.Screen options={{ title: 'User Profile', headerShown: true }} />
      
      <View style={styles.content}>
        <MaterialIcons name="person" size={80} color="#ccc" />
        <Text style={styles.title}>LGS User</Text>
        <Text style={styles.subtitle}>mario@lgstech.example.com</Text>
      </View>
    </View>
  );
}

import { MaterialIcons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#666" }
});
