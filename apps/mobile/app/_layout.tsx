/**
 * Expo Router - Root Layout
 */

import { Stack } from 'expo-router'
import { NativeBaseProvider } from 'native-base'

export default function RootLayout() {
  return (
    <NativeBaseProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Spect-IT' }} />
        <Stack.Screen name="tests/acuity" options={{ title: 'Visual Acuity Test' }} />
        <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      </Stack>
    </NativeBaseProvider>
  )
}

