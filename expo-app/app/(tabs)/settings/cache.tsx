import { View, Text, StyleSheet } from 'react-native';

export default function CacheScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clear Cache</Text>
      <Text style={styles.subtitle}>Wipe temporary layout assets to free up memory safety.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' }
});
