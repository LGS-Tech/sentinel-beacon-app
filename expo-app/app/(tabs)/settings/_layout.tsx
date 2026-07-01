import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      {/* A tela principal não exibe o cabeçalho superior nativo */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* Títulos configurados individualmente para cada tela secundária */}
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="sign-out" options={{ title: 'Sign Out' }} />
      <Stack.Screen name="theme" options={{ title: 'Theme' }} />
      <Stack.Screen name="text-size" options={{ title: 'Text Size' }} />
      <Stack.Screen name="storage" options={{ title: 'Storage Usage' }} />
      <Stack.Screen name="cache" options={{ title: 'Clear Cache' }} />
      <Stack.Screen name="version" options={{ title: 'App Version' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
    </Stack>
  );
}
