import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { StaggerItem } from './auth-controls';

const RED = '#D71920';

type NavKey = 'login' | 'create';
type NavPath = '/login' | '/registerPage';

/** Left navigation rail shared by the login and create-account desktop screens. */
export function AuthSidebar({
  active,
  onNavigate,
}: {
  active: NavKey;
  onNavigate?: (path: NavPath) => void;
}) {
  const router = useRouter();

  function go(path: NavPath) {
    if (onNavigate) onNavigate(path);
    else router.replace(path);
  }

  return (
    <View style={styles.sidebar}>
      <View>
        <StaggerItem delay={0} style={styles.brandRow}>
          <Image
            source={require('../../assets/images/LGS-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandText}>LGS tech</Text>
        </StaggerItem>

        <StaggerItem delay={60}>
          <NavItem
            label="Login"
            iconName="person"
            active={active === 'login'}
            onPress={() => go('/login')}
          />
        </StaggerItem>
        <StaggerItem delay={110}>
          <NavItem
            label="Sign Up"
            iconName="person-add-alt-1"
            active={active === 'create'}
            onPress={() => go('/registerPage')}
          />
        </StaggerItem>
      </View>

      <StaggerItem delay={160} style={styles.helpBox}>
        <Text style={styles.helpTitle}>Need help?</Text>
        <Text style={styles.helpSubtitle}>Contact support team</Text>
        <SupportButton />
      </StaggerItem>
    </View>
  );
}

function NavItem({
  label,
  iconName,
  active,
  onPress,
}: {
  label: string;
  iconName: React.ComponentProps<typeof MaterialIcons>['name'];
  active: boolean;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const highlight = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    highlight.value = withTiming(active ? 1 : hovered ? 0.5 : 0, {
      duration: 160,
    });
  }, [active, hovered, highlight]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: active
      ? 'rgba(215,25,32,0.1)'
      : `rgba(215,25,32,${highlight.value * 0.06})`,
  }));

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Animated.View style={[styles.navItem, containerStyle]}>
        <MaterialIcons
          name={iconName}
          size={19}
          color={active ? RED : '#333'}
        />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function SupportButton() {
  const scale = useSharedValue(1);
  const hover = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      hover.value,
      [0, 1],
      ['rgba(215,25,32,0)', RED],
    ),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(hover.value, [0, 1], [RED, '#FFFFFF']),
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 160 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 160 });
      }}
    >
      <Animated.View style={[styles.supportBtn, containerStyle]}>
        <Animated.Text style={[styles.supportBtnText, textStyle]}>
          Contact support
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

export function LanguageSelector() {
  const hover = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      hover.value,
      [0, 1],
      ['rgba(0,0,0,0)', '#F2F2F2'],
    ),
  }));

  return (
    <Pressable
      onHoverIn={() => {
        hover.value = withTiming(1, { duration: 150 });
      }}
      onHoverOut={() => {
        hover.value = withTiming(0, { duration: 150 });
      }}
    >
      <Animated.View style={[styles.langBtn, style]}>
        <MaterialIcons name="language" size={17} color="#666" />
        <Text style={styles.langText}>English</Text>
        <MaterialIcons name="expand-more" size={17} color="#666" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EDEDED',
    paddingVertical: 28,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 34,
    paddingHorizontal: 6,
  },
  brandLogo: {
    width: 30,
    height: 30,
    marginRight: 9,
  },
  brandText: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111',
    letterSpacing: 0.2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  navLabelActive: {
    color: RED,
  },
  helpBox: {},
  helpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: 12.5,
    color: '#888',
    marginBottom: 12,
  },
  supportBtn: {
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  supportBtnText: {
    color: RED,
    fontWeight: '700',
    fontSize: 13.5,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  langText: {
    fontSize: 13.5,
    color: '#666',
    fontWeight: '500',
  },
});
