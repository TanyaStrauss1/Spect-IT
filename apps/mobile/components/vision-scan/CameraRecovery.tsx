/**
 * Camera Permission Recovery Component
 * Provides UI and actions for recovering from camera permission/error issues
 */

import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native'

export interface CameraRecoveryProps {
  error: 'permission-denied' | 'camera-unavailable' | 'camera-error'
  onRetry: () => void
  onCancel: () => void
}

export function CameraRecovery({ error, onRetry, onCancel }: CameraRecoveryProps) {
  const handleOpenSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:')
    } else {
      Linking.openSettings()
    }
  }

  const getMessage = () => {
    switch (error) {
      case 'permission-denied':
        return {
          icon: '🔒',
          title: 'Camera Permission Required',
          message: 'Vision Scan needs camera access to analyze your eye function. Please grant camera permission to continue.',
          showSettings: true
        }
      case 'camera-unavailable':
        return {
          icon: '📷',
          title: 'Camera Unavailable',
          message: 'The camera is currently unavailable. It may be in use by another app. Please close other apps and try again.',
          showSettings: false
        }
      case 'camera-error':
        return {
          icon: '⚠️',
          title: 'Camera Error',
          message: 'An error occurred while accessing the camera. Please try again or restart the app.',
          showSettings: false
        }
    }
  }

  const { icon, title, message, showSettings } = getMessage()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry camera access"
            accessibilityHint="Attempts to access the camera again"
          >
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
          
          {showSettings && (
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={handleOpenSettings}
              accessibilityRole="button"
              accessibilityLabel="Open device settings"
              accessibilityHint="Opens your device settings to grant camera permission"
            >
              <Text style={styles.settingsButtonText}>⚙️ Open Settings</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel and go back"
            accessibilityHint="Returns to the previous screen"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
})
