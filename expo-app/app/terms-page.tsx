import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

export default function TermsPage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>Terms & Conditions (v1)</Text>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.placeholder}>
          Placeholder — real Terms & Conditions text to be added here.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5', padding: 25 },
  back: { fontSize: 18, color: '#111', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 20 },
  content: { paddingBottom: 40 },
  placeholder: { fontSize: 15, color: '#666', lineHeight: 22 },
});