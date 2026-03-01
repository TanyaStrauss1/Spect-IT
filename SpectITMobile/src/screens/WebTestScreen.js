import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/colors';

export default function WebTestScreen({ route, navigation }) {
  const { testId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const BASE_URL = 'https://www.spect-it.com';

  // Map test IDs to website routes
  const testUrls = {
    prescription: `${BASE_URL}#tests`,
    'color-blindness': `${BASE_URL}#tests`,
    astigmatism: `${BASE_URL}#tests`,
    contrast: `${BASE_URL}#tests`,
    'visual-field': `${BASE_URL}#tests`,
    'visual-acuity': `${BASE_URL}#tests`,
    'amsler-grid': `${BASE_URL}#tests`,
    'near-vision': `${BASE_URL}#tests`,
    duochrome: `${BASE_URL}#tests`,
    'stereo-acuity': `${BASE_URL}#tests`,
  };

  const testUrl = testUrls[testId] || `${BASE_URL}#tests`;
  const injectedAutoStartScript = `
    (function () {
      var testId = ${JSON.stringify(testId || '')};
      if (!testId) return true;
      function startMatchingTest() {
        var card = document.querySelector('.test-card[data-test="' + testId + '"]');
        if (!card) return false;
        var button = card.querySelector('button.btn-test');
        if (button) {
          button.click();
          return true;
        }
        return false;
      }
      setTimeout(startMatchingTest, 900);
      setTimeout(startMatchingTest, 1800);
      return true;
    })();
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <WebView
        source={{ uri: testUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        injectedJavaScript={injectedAutoStartScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

