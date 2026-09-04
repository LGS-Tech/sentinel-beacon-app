import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  AuthButton,
  AuthCheckbox,
  AuthDropdown,
  AuthInput,
  DropdownGroup,
  HoverLink,
  isValidEmail,
  StaggerItem,
} from '@/components/auth/auth-controls';
import { AuthSidebar, LanguageSelector } from '@/components/auth/auth-sidebar';
import { usePageTransition } from '@/components/auth/use-page-transition';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Engineering',
  'Business Administration',
  'Design',
  'Health Sciences',
];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];
const ADDRESS_TYPES = [
  'On Campus Residence',
  'Off Campus - Local',
  'Off Campus - Commuter',
  'Other',
];
const CITIES = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria'];
const CITY_STATE_MAP: Record<string, string> = {
  'Cape Town': 'Western Cape',
  Johannesburg: 'Gauteng',
  Durban: 'KwaZulu-Natal',
  Pretoria: 'Gauteng',
};

type Step = 1 | 2;

export default function RegisterPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { pageStyle, navigate } = usePageTransition();

  const pageEnter = useSharedValue(0);
  React.useEffect(() => {
    pageEnter.value = withTiming(1, { duration: 520 });
  }, [pageEnter]);
  const cardEnterStyle = useAnimatedStyle(() => ({
    opacity: pageEnter.value,
    transform: [
      { translateY: (1 - pageEnter.value) * 24 },
      { scale: 0.96 + pageEnter.value * 0.04 },
    ],
  }));

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [hasNavigated, setHasNavigated] = useState(false);

  // Step 1 fields
  const [fullName, setFullName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Step 2 fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [addressType, setAddressType] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [agree, setAgree] = useState(false);

  function goToStep2() {
    if (!fullName.trim()) {
      Alert.alert('Missing details', 'Enter your full name.');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError('Enter a valid email address (e.g. name@university.edu).');
      return;
    }
    setEmailError('');
    setDirection('forward');
    setHasNavigated(true);
    setStep(2);
  }

  function goToStep1() {
    setDirection('back');
    setHasNavigated(true);
    setStep(1);
  }

  function onCreateAccount() {
    if (!username.trim() || !password) {
      Alert.alert('Missing details', 'Choose a username and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords do not match',
        'Confirm password must match password.',
      );
      return;
    }
    if (!agree) {
      Alert.alert('Terms required', 'Please agree to the Terms & Conditions.');
      return;
    }
    Alert.alert(
      'Account created',
      'Your account has been created. You can now log in.',
      [{ text: 'OK', onPress: () => navigate('/login') }],
    );
  }

  const state = CITY_STATE_MAP[city] ?? '';

  const stepEntering =
    direction === 'forward'
      ? SlideInRight.duration(320)
      : SlideInLeft.duration(320);
  const stepExiting =
    direction === 'forward'
      ? SlideOutLeft.duration(220)
      : SlideOutRight.duration(220);

  const step1Form = (
    <View style={styles.formGrid}>
      <View style={styles.col}>
        <StaggerItem delay={hasNavigated ? 0 : 60}>
          <AuthInput
            icon="person-outline"
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 110}>
          <AuthInput
            icon="badge"
            placeholder="College ID"
            value={collegeId}
            onChangeText={setCollegeId}
            isPassword
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 160}>
          <AuthInput
            icon="mail-outline"
            placeholder="University Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError('');
            }}
            onBlur={() => {
              if (email.trim() && !isValidEmail(email)) {
                setEmailError(
                  'Enter a valid email address (e.g. name@university.edu).',
                );
              }
            }}
            errorText={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 210}>
          <AuthInput
            icon="phone"
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </StaggerItem>
      </View>

      <View style={styles.col}>
        <AuthDropdown
          icon="apartment"
          placeholder="Department"
          value={department}
          options={DEPARTMENTS}
          onSelect={setDepartment}
        />
        <AuthDropdown
          icon="event-note"
          placeholder="Year / Semester"
          value={year}
          options={YEARS}
          onSelect={setYear}
        />

        <StaggerItem delay={hasNavigated ? 0 : 190}>
          <Text style={styles.uploadLabel}>
            Upload Student ID Card (optional)
          </Text>
          <UploadBox files={uploadedFiles} onSelect={setUploadedFiles} />
        </StaggerItem>
      </View>
    </View>
  );

  const step2Form = (
    <View style={styles.formGrid}>
      <View style={styles.col}>
        <StaggerItem delay={hasNavigated ? 0 : 60}>
          <AuthInput
            icon="person-outline"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 110}>
          <AuthInput
            icon="lock-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 160}>
          <AuthInput
            icon="lock-outline"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 210}>
          <AuthInput
            icon="calendar-today"
            placeholder="Date of Birth"
            value={dob}
            onChangeText={setDob}
          />
        </StaggerItem>
      </View>

      <View style={styles.col}>
        <AuthDropdown
          icon="apartment"
          placeholder="Permanent Address"
          value={addressType}
          options={ADDRESS_TYPES}
          onSelect={setAddressType}
        />
        <AuthDropdown
          icon="location-city"
          placeholder="City"
          value={city}
          options={CITIES}
          onSelect={setCity}
        />
        <StaggerItem delay={hasNavigated ? 0 : 190}>
          <AuthInput
            icon="map"
            placeholder="State"
            value={state}
            editable={false}
          />
        </StaggerItem>
        <StaggerItem delay={hasNavigated ? 0 : 240}>
          <AuthInput
            icon="pin-drop"
            placeholder="Pin Code"
            value={pinCode}
            onChangeText={setPinCode}
            keyboardType="numeric"
          />
        </StaggerItem>
      </View>
    </View>
  );

  const formBody = (
    <DropdownGroup>
      <Stepper step={step} />

      <Animated.View
        key={step}
        entering={hasNavigated ? stepEntering : undefined}
        exiting={stepExiting}
      >
        {step === 1 ? step1Form : step2Form}

        {step === 2 ? (
          <AuthCheckbox checked={agree} onToggle={() => setAgree((a) => !a)}>
            <Text style={styles.agreeText}>
              I agree to the{' '}
              <Text style={styles.agreeLink}>Terms & Conditions</Text>
            </Text>
          </AuthCheckbox>
        ) : null}

        <View style={{ height: 22 }} />

        {step === 1 ? (
          <AuthButton
            label="Next"
            trailingIcon="arrow-forward"
            onPress={goToStep2}
          />
        ) : (
          <View style={{ gap: 12 }}>
            <AuthButton label="Create Account" onPress={onCreateAccount} />
            <HoverLink onPress={goToStep1} style={styles.backLink}>
              ← Back to Personal Info
            </HoverLink>
          </View>
        )}
      </Animated.View>

      <HoverLink style={styles.loginLink} onPress={() => navigate('/login')}>
        Already have an account?{' '}
        <Text style={styles.loginLinkStrong}>Login</Text>
      </HoverLink>
    </DropdownGroup>
  );

  if (!isDesktop) {
    return (
      <SafeAreaView style={styles.mobileContainer}>
        <ScrollView
          contentContainerStyle={styles.mobileScroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={cardEnterStyle}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started
            </Text>
            {formBody}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.shell, pageStyle]}>
        <AuthSidebar active="create" onNavigate={navigate} />

        <ScrollView
          contentContainerStyle={styles.main}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <LanguageSelector />
          </View>

          <Animated.View style={[styles.card, cardEnterStyle]}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started
            </Text>
            {formBody}
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

function Stepper({ step }: { step: Step }) {
  const progress = useSharedValue(step === 2 ? 1 : 0);
  React.useEffect(() => {
    progress.value = withTiming(step === 2 ? 1 : 0, { duration: 260 });
  }, [step, progress]);

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? '#D71920' : '#E5E5E5',
  }));
  const circle2Style = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? '#D71920' : '#E5E5E5',
  }));

  return (
    <>
      <View style={styles.stepRow}>
        <View style={styles.stepCircleActive}>
          {step === 2 ? (
            <MaterialIcons name="check" size={16} color="#FFF" />
          ) : (
            <Text style={styles.stepText}>1</Text>
          )}
        </View>
        <Animated.View style={[styles.stepLine, lineStyle]} />
        <Animated.View style={[styles.stepCircle, circle2Style]}>
          <Text
            style={[styles.stepText, step !== 2 && styles.stepTextInactive]}
          >
            2
          </Text>
        </Animated.View>
      </View>
      <View style={styles.labelRow}>
        <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
          Personal Info
        </Text>
        <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
          Account Info
        </Text>
      </View>
    </>
  );
}

function UploadBox({
  files,
  onSelect,
}: {
  files: string[];
  onSelect: (names: string[]) => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = true;
    input.style.display = 'none';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const names = target.files
        ? Array.from(target.files).map((f) => f.name)
        : [];
      if (names.length) onSelect(names.slice(0, 5));
    };
    document.body.appendChild(input);
    inputRef.current = input;
    return () => {
      document.body.removeChild(input);
    };
  }, [onSelect]);

  function handlePress() {
    if (Platform.OS === 'web' && inputRef.current) {
      inputRef.current.click();
      return;
    }
    // No native file/image picker dependency installed yet — demo toggle instead.
    onSelect(files.length ? [] : ['id-card.jpg']);
  }

  const uploaded = files.length > 0;

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
      }}
    >
      <Animated.View
        style={[styles.uploadBox, uploaded && styles.uploadBoxActive, style]}
      >
        <MaterialIcons
          name={uploaded ? 'check-circle' : 'cloud-upload'}
          size={30}
          color="#D71920"
        />
        <Text style={styles.uploadText} numberOfLines={1}>
          {uploaded ? files.join(', ') : 'Tap to upload photos or videos'}
        </Text>
        <Text style={styles.uploadSmall}>Max 5 files, up to 20MB each</Text>
      </Animated.View>
    </Pressable>
  );
}

const RED = '#D71920';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  main: {
    flexGrow: 1,
    paddingHorizontal: 48,
    paddingVertical: 24,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    maxWidth: 720,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  card: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 44,
    paddingVertical: 40,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14.5,
    color: '#777',
    textAlign: 'center',
    marginBottom: 26,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  stepCircleActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
  stepTextInactive: {
    color: '#888',
  },
  stepLine: {
    width: 90,
    height: 2,
    marginHorizontal: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 26,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  stepLabelActive: {
    color: RED,
  },
  formGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 6,
  },
  col: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
  },
  uploadBox: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: RED,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF9F9',
  },
  uploadBoxActive: {
    backgroundColor: '#F3FBF4',
    borderColor: '#2E9B4F',
  },
  uploadText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  uploadSmall: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  agreeText: {
    fontSize: 13.5,
    color: '#444',
  },
  agreeLink: {
    color: RED,
    fontWeight: '700',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null),
  },
  backLink: {
    textAlign: 'center',
    color: '#777',
    fontSize: 13.5,
  },
  loginLink: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14.5,
    marginTop: 22,
  },
  loginLinkStrong: {
    color: RED,
    fontWeight: '700',
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  mobileScroll: {
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 40,
  },
});
