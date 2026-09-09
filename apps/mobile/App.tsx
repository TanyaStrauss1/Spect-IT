import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const SITE_URL = 'https://www.spect-it.com/';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <WebView
          source={{ uri: SITE_URL }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          mediaCapturePermissionGrantType="grantIfSameHostElsePrompt"
          geolocationEnabled
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#c9a962" />
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1e3a5f'
  },
  webview: {
    flex: 1,
    backgroundColor: '#faf9f7'
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e3a5f'
  }
});
