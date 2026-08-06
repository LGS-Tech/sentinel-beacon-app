import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

export default function RegisterPage({ navigation }: any) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </Pressable>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>Fill in your details to get started</Text>

        <View style={styles.stepContainer}>
          <View style={styles.stepCircleActive}>
            <Text style={styles.stepText}>1</Text>
          </View>

          <View style={styles.line} />

          <View style={styles.stepCircle}>
            <Text style={styles.stepInactive}>2</Text>
          </View>
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.activeLabel}>Personal Info</Text>
          <Text style={styles.inactiveLabel}>Account Info</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="College ID"
          value={collegeId}
          onChangeText={setCollegeId}
        />

        <TextInput
          style={styles.input}
          placeholder="University Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Department"
          value={department}
          onChangeText={setDepartment}
        />

        <TextInput
          style={styles.input}
          placeholder="Year / Semester"
          value={year}
          onChangeText={setYear}
        />

        <Text style={styles.uploadTitle}>Upload Student ID Card</Text>

        <Pressable style={styles.uploadBox}>
          <Text style={styles.uploadIcon}>☁</Text>
          <Text style={styles.uploadText}>Tap to upload</Text>
          <Text style={styles.uploadSmall}>JPG, PNG up to 5MB</Text>
        </Pressable>

        <Pressable style={styles.nextButton}>
          <Text style={styles.nextText}>Next</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
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
