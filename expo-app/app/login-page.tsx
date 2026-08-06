import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { loginWithEmailPassword } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  async function onLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Enter email and password.');
      return;
    }

    setBusy(true);
    try {
      await loginWithEmailPassword(email, password);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert(
        'Login failed',
        e instanceof Error
          ? e.message
          : 'Could not sign in. Is the Express server running?',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        <Image
          source={require('../assets/images/LGS-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.appTitle}>LGS Tech</Text>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="University Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!busy}
        />

        {/* Password */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />

        {/* Remember + Forgot */}
        <View style={styles.optionsRow}>
          <Pressable
            style={styles.rememberContainer}
            onPress={() => setRemember(!remember)}
            disabled={busy}
          >
            <View
              style={[styles.checkbox, remember && styles.checkboxChecked]}
            />
            <Text style={styles.rememberText}>Remember Me</Text>
          </Pressable>

          <Pressable disabled={busy}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Login */}
        <Pressable
          style={[styles.loginButton, busy && { opacity: 0.7 }]}
          onPress={onLogin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </Pressable>

        {/* Create Account */}
        <Pressable
          style={styles.createButton}
          onPress={() => router.push('/registerPage')}
        >
          <Text style={styles.createText}>Create Account</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '100%',
    paddingHorizontal: 25,
  },

  cardDesktop: {
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 44,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  logo: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 15,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D71920',
    textAlign: 'center',
    marginBottom: 35,
  },

  input: {
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 15,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#888',
    marginRight: 8,
    borderRadius: 3,
  },

  checkboxChecked: {
    backgroundColor: '#D71920',
    borderColor: '#D71920',
  },

  rememberText: {
    fontSize: 14,
    color: '#333',
  },

  forgotText: {
    color: '#C62828',
    fontWeight: '500',
  },

  loginButton: {
    backgroundColor: '#D71920',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  createButton: {
    height: 55,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  createText: {
    color: '#222',
    fontSize: 17,
    fontWeight: '600',
  },

  version: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 12,
  },
});
