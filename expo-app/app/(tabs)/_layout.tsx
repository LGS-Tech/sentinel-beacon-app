import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAuthToken, hydrateSession } from '@/lib/api';

function DesktopTabBar({ state, descriptors, navigation }: any) {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={desktopStyles.bar}>
      <View style={desktopStyles.brand}>
        <Text style={desktopStyles.brandText}>LGS Tech</Text>
      </View>
      <View style={desktopStyles.separator} />
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label: string = options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={[desktopStyles.tab, isFocused && desktopStyles.activeTab]}
          >
            {options.tabBarIcon?.({
              color: isFocused ? activeColor : '#6B7280',
              size: 20,
              focused: isFocused,
            })}
            <Text
              style={[
                desktopStyles.tabLabel,
                { color: isFocused ? activeColor : '#6B7280' },
                isFocused && desktopStyles.activeLabel,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const desktopStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    height: 56,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  brand: {
    marginRight: 4,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D71920',
    letterSpacing: -0.3,
  },
  separator: {
    width: 1,
    height: 26,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 4,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeLabel: {
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      await hydrateSession();
      const token = await getAuthToken();

      if (active) {
        setAuthenticated(Boolean(token));
        setCheckingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (checkingSession) {
    return (
      <View style={desktopStyles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authenticated) {
    return <Redirect href="/login-page" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
      tabBar={isDesktop ? (props) => <DesktopTabBar {...props} /> : undefined}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="lock.shield.fill" color={color} />
          ),
        }}
      />
      {/* ALTERADO: name mudou de "settings" para "settings" para carregar a pasta inteira */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gear.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
