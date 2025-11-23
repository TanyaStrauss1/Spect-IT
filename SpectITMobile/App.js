import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, SafeAreaView, StatusBar, Platform, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0); // Key to force WebView remount

  const websiteUrl = 'https://www.spect-it.com';

  const handleLoadStart = () => {
    // Reset error state when starting to load (in case of retry)
    setError(false);
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setError(false); // Reset error state on successful load
    SplashScreen.hideAsync();
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    // Set error state to show error overlay with retry button
    setError(true);
    setLoading(false);
    SplashScreen.hideAsync();
  };

  const handleRetry = () => {
    console.log('Retry button pressed - resetting error and reloading...');
    // CRITICAL: Reset error state FIRST to immediately hide error overlay
    setError(false);
    // Set loading to show loading indicator
    setLoading(true);
    // Force WebView to remount by changing key
    // This creates a fresh WebView instance and triggers onLoadStart
    setWebViewKey(prev => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#667eea" />
      <WebView
        key={webViewKey}
        source={{ uri: websiteUrl }}
        style={styles.webview}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        // Enable camera and location permissions
        geolocationEnabled={true}
        // User agent for better compatibility
        userAgent={Platform.select({
          ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
          android: 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
        })}
        // Inject JavaScript for better mobile experience
        injectedJavaScript={`
          (function() {
            // Prevent zoom on double tap
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.getElementsByTagName('head')[0].appendChild(meta);
            
            // Improve touch interactions
            document.addEventListener('touchstart', function(e) {
              if (e.touches.length > 1) {
                e.preventDefault();
              }
            }, { passive: false });
            
            // Enable camera access prompts
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              // Camera is available
              console.log('Camera API available');
            }
            
            // Enable geolocation
            if (navigator.geolocation) {
              console.log('Geolocation API available');
            }
          })();
          true; // Required for injected JavaScript
        `}
        // Handle navigation
        onNavigationStateChange={(navState) => {
          // Keep navigation within the app
          if (!navState.url.includes('spect-it.com') && !navState.url.startsWith('mailto:') && !navState.url.startsWith('tel:')) {
            // External links - could open in browser if needed
            console.log('External link:', navState.url);
          }
        }}
        // Handle messages from web
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('Message from web:', data);
            // Handle messages from website if needed
          } catch (e) {
            console.log('Message from web (non-JSON):', event.nativeEvent.data);
          }
        }}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load Spect-IT.{'\n'}Please check your internet connection and try again.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            activeOpacity={0.7}
            accessibilityLabel="Retry loading Spect-IT"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

