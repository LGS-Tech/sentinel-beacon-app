import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: "#DC2626",
        headerStyle: { backgroundColor: "#F8F8F8" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F8F8F8" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen
        name="roles-access"
        options={{ title: "Roles & Access" }}
      />
      <Stack.Screen
        name="change-password"
        options={{ title: "Change Password" }}
      />
      <Stack.Screen name="sign-out" options={{ title: "Sign Out" }} />
      <Stack.Screen
        name="ticket-preferences"
        options={{ title: "Ticket preferences" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Notifications" }}
      />
      <Stack.Screen name="permissions" options={{ title: "Permissions" }} />
      <Stack.Screen name="integrations" options={{ title: "Integrations" }} />
      <Stack.Screen name="theme" options={{ title: "Theme" }} />
      <Stack.Screen name="text-size" options={{ title: "Text Size" }} />
      <Stack.Screen name="storage" options={{ title: "Storage Usage" }} />
      <Stack.Screen name="cache" options={{ title: "Clear Cache" }} />
      <Stack.Screen name="version" options={{ title: "App Version" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy Policy" }} />
    </Stack>
  );
}
