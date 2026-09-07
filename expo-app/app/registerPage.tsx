import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { signupWithEmailPassword } from '@/lib/api';

const MIN_PASSWORD_LENGTH = 6;

function usernameFromEmail(email: string): string {
  const local = email.trim().split('@')[0] ?? '';
  const cleaned = local.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 32);
  return cleaned || 'user';
}

export default function RegisterPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [step, setStep] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const step2Ready = useMemo(
    () => Boolean(username.trim() && password && confirmPassword),
    [username, password, confirmPassword],
  );

  function goBack() {
    if (busy) return;
    if (step === 2) {
      setStep(1);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login-page');
    }
  }

  function onNextPersonal() {
    if (!fullName.trim()) {
      Alert.alert('Missing details', 'Enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing details', 'Enter your university email.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!username.trim()) {
      setUsername(usernameFromEmail(email));
    }
    setStep(2);
  }

  async function onCreateAccount() {
    if (!username.trim()) {
      Alert.alert('Missing details', 'Enter a username.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert(
        'Weak password',
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirmation do not match.');
      return;
    }

    setBusy(true);
    try {
      await signupWithEmailPassword({
        name: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        phone: phone.trim() || undefined,
        collegeId: collegeId.trim() || undefined,
        yearSemester: year.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert(
        'Sign up failed',
        e instanceof Error
          ? e.message
          : 'Could not create account. Is the PostgreSQL backend running?',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
      >
        <Pressable onPress={goBack} disabled={busy}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          {step === 1
            ? 'Fill in your details to get started'
            : 'Choose a username and password'}
        </Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepCircleActive}>
            <Text style={styles.stepText}>1</Text>
          </View>

          <View
            style={[styles.line, step === 1 && styles.lineInactive]}
          />

          <View
            style={step === 2 ? styles.stepCircleActive : styles.stepCircle}
          >
            <Text
              style={step === 2 ? styles.stepText : styles.stepInactive}
            >
              2
            </Text>
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text
            style={step === 1 ? styles.activeLabel : styles.inactiveLabel}
          >
            Personal Info
          </Text>
          <Text
            style={step === 2 ? styles.activeLabel : styles.inactiveLabel}
          >
            Account Info
          </Text>
        </View>

        {step === 1 ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={setFullName}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="College ID"
              placeholderTextColor="#999"
              value={collegeId}
              onChangeText={setCollegeId}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="University Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="Department"
              placeholderTextColor="#999"
              value={department}
              onChangeText={setDepartment}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="Year / Semester"
              placeholderTextColor="#999"
              value={year}
              onChangeText={setYear}
              editable={!busy}
            />

            <Text style={styles.uploadTitle}>Upload Student ID Card</Text>

            <Pressable style={styles.uploadBox} disabled={busy}>
              <Text style={styles.uploadIcon}>☁</Text>
              <Text style={styles.uploadText}>Tap to upload</Text>
              <Text style={styles.uploadSmall}>JPG, PNG up to 5MB</Text>
            </Pressable>

            <Pressable
              style={[styles.nextButton, busy && { opacity: 0.7 }]}
              onPress={onNextPersonal}
              disabled={busy}
            >
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!busy}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!busy}
            />

            <Pressable
              style={[
                styles.nextButton,
                (busy || !step2Ready) && { opacity: 0.7 },
              ]}
              onPress={onCreateAccount}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.nextText}>Create Account</Text>
              )}
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => router.replace('/login-page')}
          disabled={busy}
        >
          <Text style={styles.loginLink}>
            Already have an account?
            <Text style={{ color: '#D71920', fontWeight: '700' }}> Login</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },

  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },

  scrollContentDesktop: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 40,
    paddingVertical: 40,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  back: {
    fontSize: 26,
    color: '#111',
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: '#777',
    marginBottom: 30,
  },

  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  stepCircleActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D71920',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepText: {
    color: '#FFF',
    fontWeight: '700',
  },

  stepInactive: {
    color: '#777',
    fontWeight: '700',
  },

  line: {
    width: 70,
    height: 2,
    backgroundColor: '#D71920',
    marginHorizontal: 10,
  },

  lineInactive: {
    backgroundColor: '#E5E5E5',
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 30,
  },

  activeLabel: {
    color: '#D71920',
    fontWeight: '700',
  },

  inactiveLabel: {
    color: '#999',
  },

  input: {
    height: 56,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 15,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
    color: '#222',
  },

  uploadBox: {
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D71920',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 25,
  },

  uploadIcon: {
    fontSize: 35,
    color: '#D71920',
    marginBottom: 10,
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  uploadSmall: {
    fontSize: 13,
    color: '#888',
    marginTop: 5,
  },

  nextButton: {
    backgroundColor: '#D71920',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  nextText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  loginLink: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    marginBottom: 30,
  },
});
