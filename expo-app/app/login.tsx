import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {
  AuthButton,
  AuthCheckbox,
  AuthInput,
  HoverLink,
  isValidEmail,
  StaggerItem,
} from '@/components/auth/auth-controls';
import { AuthSidebar, LanguageSelector } from '@/components/auth/auth-sidebar';
import { LoginIllustration } from '@/components/auth/login-illustration';
import { usePageTransition } from '@/components/auth/use-page-transition';
import { loginWithEmailPassword } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const { pageStyle, navigate } = usePageTransition();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);

  const cardEnter = useSharedValue(0);
  const heroEnter = useSharedValue(0);

  React.useEffect(() => {
    heroEnter.value = withTiming(1, { duration: 520 });
    cardEnter.value = withDelay(200, withTiming(1, { duration: 560 }));
  }, [cardEnter, heroEnter]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardEnter.value,
    transform: [
      { translateY: (1 - cardEnter.value) * 26 },
      { scale: 0.94 + cardEnter.value * 0.06 },
    ],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroEnter.value,
    transform: [{ translateX: (1 - heroEnter.value) * -36 }],
  }));

  async function onLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        'Missing details',
        'Enter your username or email and password.',
      );
      return;
    }
    if (email.includes('@') && !isValidEmail(email)) {
      setEmailError('Enter a valid email address (e.g. name@example.com).');
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

  if (!isDesktop) {
    return (
      <SafeAreaView style={styles.mobileContainer}>
        <Animated.View style={[styles.mobileCard, cardStyle]}>
          <Text style={styles.mobileBrand}>LGS tech</Text>
          <Text style={styles.mobileTagline}>Stay informed. Stay safe.</Text>

          <AuthInput
            icon="mail-outline"
            placeholder="Username or Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (emailError) setEmailError('');
            }}
            onBlur={() => {
              if (email.includes('@') && !isValidEmail(email)) {
                setEmailError(
                  'Enter a valid email address (e.g. name@example.com).',
                );
              }
            }}
            errorText={emailError}
            autoCapitalize="none"
            editable={!busy}
          />
          <AuthInput
            icon="lock-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            isPassword
            editable={!busy}
          />

          <View style={styles.optionsRow}>
            <AuthCheckbox
              checked={remember}
              onToggle={() => setRemember((r) => !r)}
            >
              <Text style={styles.rememberText}>Remember me</Text>
            </AuthCheckbox>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </View>

          <AuthButton label="Login" onPress={onLogin} loading={busy} />
          <View style={{ height: 12 }} />
          <AuthButton
            label="Sign Up"
            variant="secondary"
            onPress={() => router.push('/registerPage')}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.shell, pageStyle]}>
        <AuthSidebar active="login" onNavigate={navigate} />

        <View style={styles.main}>
          <View style={styles.topBar}>
            <LanguageSelector />
          </View>

          <View style={styles.contentRow}>
            <Animated.View style={[styles.heroCol, heroStyle]}>
              <Text style={styles.hero}>Stay informed.{'\n'}Stay safe.</Text>
              <LoginIllustration />
            </Animated.View>

            <Animated.View style={[styles.card, cardStyle]}>
              <StaggerItem delay={140}>
                <AuthInput
                  icon="mail-outline"
                  placeholder="Username or Email"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => {
                    if (email.includes('@') && !isValidEmail(email)) {
                      setEmailError(
                        'Enter a valid email address (e.g. name@example.com).',
                      );
                    }
                  }}
                  errorText={emailError}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!busy}
                />
              </StaggerItem>
              <StaggerItem delay={185}>
                <AuthInput
                  icon="lock-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  editable={!busy}
                />
              </StaggerItem>

              <StaggerItem delay={225}>
                <View style={styles.optionsRow}>
                  <AuthCheckbox
                    checked={remember}
                    onToggle={() => setRemember((r) => !r)}
                  >
                    <Text style={styles.rememberText}>Remember me</Text>
                  </AuthCheckbox>
                  <HoverLink
                    style={styles.forgotText}
                    onPress={() =>
                      Alert.alert(
                        'Forgot password',
                        'Password reset is not wired up yet.',
                      )
                    }
                  >
                    Forgot password?
                  </HoverLink>
                </View>
              </StaggerItem>

              <StaggerItem delay={265}>
                <AuthButton label="Login" onPress={onLogin} loading={busy} />
              </StaggerItem>
              <View style={{ height: 12 }} />
              <StaggerItem delay={305}>
                <AuthButton
                  label="Sign Up"
                  variant="secondary"
                  onPress={() => navigate('/registerPage')}
                />
              </StaggerItem>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

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
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 48,
  },
  heroCol: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    fontSize: 40,
    fontWeight: '800',
    color: '#15181C',
    lineHeight: 48,
    marginBottom: 24,
  },
  card: {
    width: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 34,
    paddingVertical: 38,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  rememberText: {
    fontSize: 13.5,
    color: '#333',
  },
  forgotText: {
    color: '#D71920',
    fontWeight: '600',
    fontSize: 13.5,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : null),
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileCard: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 25,
  },
  mobileBrand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#D71920',
    textAlign: 'center',
  },
  mobileTagline: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});
