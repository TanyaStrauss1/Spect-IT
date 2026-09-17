import { Stack } from 'expo-router'
import { AuthProvider } from '../lib/auth/auth-context'
import { ParticipantProvider } from '../lib/participants/participant-context'

export default function RootLayout() {
  return (
    <AuthProvider>
      <ParticipantProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/signin" options={{ title: 'Sign In' }} />
          <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
          <Stack.Screen name="test/acuity" options={{ title: 'Visual Acuity Test' }} />
          <Stack.Screen name="vision-scan/index" options={{ title: 'Vision Scan' }} />
          <Stack.Screen name="vision-scan/qualification" options={{ title: 'Device Qualification' }} />
          <Stack.Screen name="vision-scan/calibration" options={{ title: 'Calibration' }} />
          <Stack.Screen name="vision-scan/alignment" options={{ title: 'Resting Alignment' }} />
          <Stack.Screen name="vision-scan/motility" options={{ title: '9-Position Motility' }} />
          <Stack.Screen name="vision-scan/convergence" options={{ title: 'Dynamic Convergence' }} />
          <Stack.Screen name="vision-scan/results" options={{ title: 'Vision Scan Results' }} />
        </Stack>
      </ParticipantProvider>
    </AuthProvider>
  )
}
