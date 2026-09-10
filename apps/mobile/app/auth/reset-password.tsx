import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const { updatePassword, session } = useAuth()

  useEffect(() => {
    if (session) {
      setIsRecoverySession(true)
    }
  }, [session])

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    if (!isRecoverySession) {
      Alert.alert('Error', 'Invalid or expired reset link. Please request a new one.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert(
        'Success',
        'Password updated successfully!',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      )
    }
  }

  if (!isRecoverySession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Invalid Link</Text>
        <Text style={styles.subtitle}>
          This password reset link is invalid or has expired.
        </Text>

        <View style={styles.form}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.buttonText}>Request New Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/signin')}>
            <Text style={styles.link}>
              ← <Text style={styles.linkBold}>Back to Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.subtitle}>Enter your new password below</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 20,
    justifyContent: 'center',
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
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
  },
  linkBold: {
    color: '#4F46E5',
    fontWeight: '600',
  },
})
