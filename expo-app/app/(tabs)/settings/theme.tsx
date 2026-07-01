import { View, Text, StyleSheet } from 'react-native';

export default function ThemeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appearance Theme</Text>
      <Text style={styles.subtitle}>Switch between Light, Dark, or System default modes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' }
});
