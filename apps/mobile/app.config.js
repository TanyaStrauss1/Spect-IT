export default {
  expo: {
    name: "Spect-IT Vision Screening",
    slug: "spect-it-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "spectit",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1e3a5f"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.spectit.app",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "Spect-IT uses your camera to calibrate and perform vision screening tests. This includes face detection for accurate measurement distances and grid pattern analysis for astigmatism screening.",
        NSLocationWhenInUseUsageDescription: "Spect-IT can use your location to find nearby optical practices and help you book appointments. Location access is completely optional.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1e3a5f"
      },
      package: "com.spectit.app",
      permissions: [
        "CAMERA",
        "ACCESS_COARSE_LOCATION"
      ],
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "spectit"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    },
    privacy: "public",
    privacyPolicyUrl: "https://spect-it.com/privacy"
  }
};
