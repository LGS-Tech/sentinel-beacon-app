import { View, Text, StyleSheet } from 'react-native';

export default function SignOutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Out</Text>
      <Text style={styles.subtitle}>Are you sure you want to log out of your profile?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { color: '#aaa', fontSize: 14, textAlign: 'center' }
});
