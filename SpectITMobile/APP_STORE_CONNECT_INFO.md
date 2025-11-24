# App Store Connect Configuration

## Required Information for App Submission

### Bundle ID
**Value:** `com.spectit.app`

This is already configured in:
- `SpectITMobile/app.json` → `ios.bundleIdentifier`
- `SpectITCapacitor/app.json` → `ios.bundleIdentifier`
- Xcode project → `PRODUCT_BUNDLE_IDENTIFIER`

**Note:** This Bundle ID must be registered in your Apple Developer account before submission.

---

### Primary Language
**Value:** `English (U.S.)`

This is the primary language for your app listing in App Store Connect.

**Alternative options:**
- English (U.S.) - Recommended
- English (U.K.)
- English (Australia)
- English (South Africa) - If targeting SA market

---

### SKU (Stock Keeping Unit)
**Value:** `spectit-mobile-001`

**What is SKU?**
- A unique identifier for your app in App Store Connect
- Used for internal tracking and reporting
- Cannot be changed after app creation
- Format: alphanumeric, no spaces, typically lowercase with hyphens

**Recommended SKU formats:**
- `spectit-mobile-001` - For SpectITMobile app
- `spectit-premium-001` - For SpectITCapacitor/Premium app
- `spectit-ios-001` - Alternative format

---

## Complete App Store Connect Form Values

### Basic Information
- **Platform:** iOS
- **Name:** Spect-IT
- **Primary Language:** English (U.S.)
- **Bundle ID:** `com.spectit.app`
- **SKU:** `spectit-mobile-001`
- **User Access:** Full Access

### App Information
- **Name:** Spect-IT
- **Subtitle:** Professional Eye Testing
- **Category:** Health & Fitness
- **Secondary Category:** Medical (optional)
- **Content Rights:** You have the rights to use all content

### Pricing and Availability
- **Price:** Free
- **Availability:** All countries (or select specific countries)

### Version Information
- **Version:** 1.0.0
- **Build Number:** 1
- **What's New:** (See APP_STORE_CONTENT.md)

---

## Verification Checklist

Before submitting to App Store Connect:

- [ ] Bundle ID `com.spectit.app` is registered in Apple Developer account
- [ ] Team ID `P7BPRR2MY3` is configured in app.json
- [ ] Bundle ID matches in all configuration files
- [ ] SKU is unique and follows naming convention
- [ ] Primary Language is selected
- [ ] All app information is complete
- [ ] Screenshots are prepared
- [ ] App description is ready
- [ ] Privacy policy URL is available

---

## Next Steps

1. **Register Bundle ID in Apple Developer:**
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Click "+" to create new App ID
   - Enter: `com.spectit.app`
   - Select capabilities (Push Notifications, Camera, Location, etc.)

2. **Create App in App Store Connect:**
   - Go to: https://appstoreconnect.apple.com
   - Click "My Apps" → "+" → "New App"
   - Fill in the values above
   - Click "Create"

3. **Complete App Information:**
   - Add screenshots
   - Write description
   - Set pricing
   - Configure availability

---

## Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/appstoreconnect)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Bundle ID Registration Guide](https://developer.apple.com/help/app-store-connect/manage-apps/create-an-app-record)

