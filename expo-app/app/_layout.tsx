import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'

import { AppearanceProvider, useAppearance } from '@/contexts/appearance'

export const unstable_settings = {
  anchor: '(tabs)',
}

function RootNavigation() {
  const { colorScheme } = useAppearance()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: ""
          }}
        />

        <Stack.Screen
          name="vault-folder"
          options={{
            headerBackTitle: ""
          }}
        />

        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />

        <Stack.Screen
          name="login-page"
          options={{ headerShown: false, title: 'Login' }}
        />

        <Stack.Screen
          name="registerPage"
          options={{ headerShown: false, title: 'Register' }}
        />

      </Stack>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <RootNavigation />
    </AppearanceProvider>
  )
}
