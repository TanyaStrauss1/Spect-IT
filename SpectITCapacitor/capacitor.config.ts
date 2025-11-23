import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spectit.app',
  appName: 'Spect-IT',
  webDir: '../website',
  server: {
    // For production, uncomment and set to your live URL
    // url: 'https://www.spect-it.com',
    // cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#667eea",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#667eea"
    },
    Camera: {
      permissions: {
        camera: "Spect-IT uses your camera to perform professional eye tests and vision measurements.",
        photos: "Spect-IT saves your test results and reports to your photo library."
      }
    },
    Geolocation: {
      permissions: {
        location: "Spect-IT uses your location to find nearby eye care professionals and retailers."
      }
    }
  }
};

export default config;
