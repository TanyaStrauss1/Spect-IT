import { Stack } from 'expo-router'
import { AuthProvider } from '../lib/auth/auth-context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signin" options={{ title: 'Sign In' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
        <Stack.Screen name="test/acuity" options={{ title: 'Visual Acuity Test' }} />
      </Stack>
    </AuthProvider>
  )
}
