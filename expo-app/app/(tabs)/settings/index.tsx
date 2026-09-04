import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SettingsColors, settingsStyles } from '@/constants/settings-theme';
import {
  getAccessLevelLabel,
  getCurrentUserId,
  getUser,
  getUserPhone,
  hydrateSession,
  type User,
} from '@/lib/api';

type SettingItem = {
  id: string;
  label: string;
  route: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type SettingSection = {
  title: string;
  data: SettingItem[];
};

const sections: SettingSection[] = [
  {
    title: 'Account',
    data: [
      {
        id: '1',
        label: 'Profile',
        route: '/settings/profile',
        icon: 'person-outline',
      },
      {
        id: '2',
        label: 'Roles & Access',
        route: '/settings/roles-access',
        icon: 'badge',
      },
      {
        id: '3',
        label: 'Change Password',
        route: '/settings/change-password',
        icon: 'lock-outline',
      },
      {
        id: '4',
        label: 'Sign Out',
        route: '/settings/sign-out',
        icon: 'logout',
      },
    ],
  },
  {
    title: 'Tickets',
    data: [
      {
        id: '5',
        label: 'Ticket preferences',
        route: '/settings/ticket-preferences',
        icon: 'confirmation-number',
      },
      {
        id: '6',
        label: 'Notifications',
        route: '/settings/notifications',
        icon: 'notifications-none',
      },
    ],
  },
  {
    title: 'Privacy',
    data: [
      {
        id: '7',
        label: 'Permissions',
        route: '/settings/permissions',
        icon: 'security',
      },
      {
        id: '8',
        label: 'Privacy Policy',
        route: '/settings/privacy',
        icon: 'policy',
      },
    ],
  },
  {
    title: 'Integrations',
    data: [
      {
        id: '9',
        label: 'Integrations',
        route: '/settings/integrations',
        icon: 'hub',
      },
    ],
  },
  {
    title: 'Appearance',
    data: [
      { id: '10', label: 'Theme', route: '/settings/theme', icon: 'palette' },
      {
        id: '11',
        label: 'Text Size',
        route: '/settings/text-size',
        icon: 'format-size',
      },
    ],
  },
  {
    title: 'Data',
    data: [
      {
        id: '12',
        label: 'Storage Usage',
        route: '/settings/storage',
        icon: 'storage',
      },
      {
        id: '13',
        label: 'Clear Cache',
        route: '/settings/cache',
        icon: 'cleaning-services',
      },
    ],
  },
  {
    title: 'About',
    data: [
      {
        id: '14',
        label: 'App Version',
        route: '/settings/version',
        icon: 'info-outline',
      },
    ],
  },
  {
    title: 'Dev',
    data: [
      {
        id: 'dev1',
        label: 'Open Login Screen',
        route: '/login',
        icon: 'login',
      },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [offline, setOffline] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          await hydrateSession();
          const loaded = await getUser(getCurrentUserId());
          if (!active) return;
          setUser(loaded);
          setOffline(!loaded);
        } catch {
          if (!active) return;
          setUser(null);
          setOffline(true);
        }
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  const renderItem = (item: SettingItem, isLast: boolean) => (
    <Pressable
      key={item.id}
      style={[styles.row, isLast && settingsStyles.rowLast]}
      onPress={() => router.push(item.route as never)}
    >
      <View style={styles.rowLeft}>
        <MaterialIcons
          name={item.icon}
          size={22}
          color={SettingsColors.muted}
          style={styles.rowIcon}
        />
        <Text style={settingsStyles.label}>{item.label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#999" />
    </Pressable>
  );

  const renderSection = ({ item }: { item: SettingSection }) => (
    <View style={styles.section}>
      <Text style={settingsStyles.sectionTitle}>{item.title}</Text>
      <View style={settingsStyles.card}>
        {item.data.map((setting, index) =>
          renderItem(setting, index === item.data.length - 1),
        )}
      </View>
    </View>
  );

  const logo = require('../../../assets/images/LGS-logo.png');

  return (
    <View style={settingsStyles.screen}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <FlatList
        data={sections}
        keyExtractor={(section) => section.title}
        renderItem={renderSection}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Pressable
            style={styles.profileCard}
            onPress={() => router.push('/settings/profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name?.[0] ?? '?').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName}>
                {user?.name ?? 'Staff member'}
              </Text>
              <Text style={settingsStyles.muted}>
                {user
                  ? `${user.role} · ${getAccessLevelLabel(user.authorisation)}`
                  : 'Role unavailable'}
              </Text>
              <Text style={settingsStyles.muted}>
                {user?.email ??
                  (offline
                    ? 'Offline — start Express API to sync'
                    : 'Loading profile…')}
              </Text>
              {user ? (
                <Text style={styles.phone}>{getUserPhone(user)}</Text>
              ) : null}
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#999" />
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SettingsColors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  logoImage: { width: 150, height: 50, marginLeft: -25 },
  list: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: SettingsColors.border,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { marginRight: 12 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SettingsColors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SettingsColors.border,
    padding: 14,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SettingsColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  profileText: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: SettingsColors.text,
    marginBottom: 2,
  },
  phone: {
    fontSize: 12,
    color: SettingsColors.muted,
    marginTop: 2,
  },
});
