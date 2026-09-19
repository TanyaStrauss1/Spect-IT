import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { VisionScanStatusCard } from '../../components/vision-scan/VisionScanStatusCard'

export default function HomeScreen() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>👁️</Text>
        <Text style={styles.title}>Spect-IT</Text>
        <Text style={styles.subtitle}>Professional Vision Screening</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/signin')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.logo}>👁️</Text>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.email}>{user.email}</Text>
        
        <View style={styles.buttonContainer}>
          <VisionScanStatusCard />

          {/* Eye Screening Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>👁️ Eye Screening</Text>
            <Text style={styles.sectionSubtitle}>Vision screening tests — results are screening only, not a diagnosis</Text>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/test/acuity')}
            >
              <Text style={styles.primaryButtonText}>👁️ Visual Acuity Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.purpleButton}
              onPress={() => router.push('/test/color-vision')}
            >
              <Text style={styles.purpleButtonText}>🎨 Color Vision Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/test/astigmatism')}
            >
              <Text style={styles.primaryButtonText}>🌀 Astigmatism Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/test/contrast')}
            >
              <Text style={styles.primaryButtonText}>🌓 Contrast Sensitivity</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/test/visual-field')}
            >
              <Text style={styles.primaryButtonText}>📍 Visual Field Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/test/prescription')}
            >
              <Text style={styles.primaryButtonText}>🔬 Prescription Test</Text>
            </TouchableOpacity>
          </View>

          {/* Hearing Screening Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>🎧 Hearing Screening</Text>
            <Text style={styles.sectionSubtitle}>Pure-tone hearing screening — results are screening only, not a diagnosis</Text>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#10B981' }]}
              onPress={() => router.push('/test/hearing')}
            >
              <Text style={styles.primaryButtonText}>🎧 Hearing Test</Text>
            </TouchableOpacity>
          </View>
        
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.secondaryButtonText}>View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.textButton}
            onPress={signOut}
          >
            <Text style={styles.textButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 48,
  },
  email: {
    fontSize: 16,
    color: '#4F46E5',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  sectionContainer: {
    width: '100%',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  purpleButton: {
    backgroundColor: '#9333EA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purpleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
  },
  textButton: {
    padding: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
})
