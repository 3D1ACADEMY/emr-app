# Store Submission Guide — EMR 3D Rejuvenation Academy

This document covers the exact steps and configuration needed to submit the Clinical Emergency Management System (CEMS) app to the Apple App Store and Google Play Store securely.

---

## 1. EAS Build initialization

Your project is already linked to the Expo/EAS project:

- Project URL: https://expo.dev/accounts/academy31/projects/emr-3d-rejuvenation
- EAS Project ID: `989c7323-bfdf-42ec-83b6-841f43e7ad4b`

If you need to re-initialize or clone into a fresh directory, run:

```bash
# Login to Expo
npx eas login

# Initialize/link the project (only needed once)
npx eas init

# Configure build profiles (generates/updates eas.json)
npx eas build:configure
```

For this repo you can skip `eas init` because `app.json` already contains the `extra.eas.projectId`.

---

## 2. `eas.json` production configuration

The production profile in `eas.json` is configured for store submission:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "env": {
        "APP_VARIANT": "production"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "ascApiKeyPath": "./AuthKey_YOURKEY.p8",
        "ascApiKeyIssuerId": "YOUR_ISSUER_ID",
        "ascApiKeyId": "YOUR_KEY_ID",
        "ascTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account-key.json",
        "track": "production"
      }
    }
  }
}
```

Replace the placeholder values under `submit.production` with your real App Store Connect and Google Play service account credentials.

---

## 3. iOS Privacy Manifest (`ios/PrivacyInfo.xcprivacy`)

The file `ios/PrivacyInfo.xcprivacy` declares that the app does **NOT** track users for advertising and lists the sensitive APIs/data types used for app functionality only.

Key declarations:

- `NSPrivacyTracking` = `false`
- `NSPrivacyTrackingDomains` = empty array
- Collected data types:
  - Health (patient context / incident logs)
  - Photos or Videos (incident documentation)
  - Audio Data (voice dictation)
  - Precise Location (emergency facility locator)
  - Name (patient name stored locally)
- All linked to `NSPrivacyCollectedDataTypePurposeAppFunctionality` only
- Accessed APIs:
  - `NSPrivacyAccessedAPICategoryUserDefaults` (SecureStore/UserDefaults) — reason `CA92.1`
  - `NSPrivacyAccessedAPICategoryFileTimestamp` — reason `C617.1`

The manifest is already created at `ios/PrivacyInfo.xcprivacy`.

---

## 4. Google Play Data Safety configuration

In the Google Play Console, complete the **Data safety** section with the following answers.

### Does your app collect or share any of the required user data types?

**Yes** — the app stores the following data locally on the device for clinical functionality:

| Data type | Collected | Shared | Ephemeral | Purpose |
|---|---|---|---|---|
| Name | Yes | No | No | App functionality |
| Health info | Yes | No | No | App functionality |
| Photos and videos | Optional | No | No | App functionality |
| Audio files | Optional | No | No | App functionality |
| Precise location | Optional | No | No | App functionality |

### Is all user data encrypted in transit?

**No data is transmitted.** The app is offline-first and all data is encrypted at rest on the device using `expo-secure-store`.

### Does your app provide a way for users to request deletion of their data?

**Yes** — users can delete incidents, patient records, photos, and voice notes within the app, and clear SecureStore via app settings.

### Additional Data Safety statements to paste

> This app is designed for licensed aesthetic medical professionals. It operates entirely offline. Patient information, incident logs, photos, voice notes, and location data are stored locally on the device and encrypted at rest using the device's secure hardware-backed keystore. No data is collected, shared, or used for advertising or tracking.

---

## 5. Generating credentials via EAS (no Mac/Windows local setup required)

EAS can generate and manage all signing credentials in the cloud. You do not need a Mac for iOS distribution certificates.

### 5.1 Login and project context

```bash
cd C:/Users/drnal/EMR-App
npx eas login
```

### 5.2 Android Keystore

Generate a new upload keystore in EAS:

```bash
npx eas credentials -p android
```

Interactive steps:

1. Select `production` build profile.
2. Select `Generate a new Android Keystore`.
3. EAS stores the keystore securely and uses it for all production builds.

To download a backup (store it in a password manager):

```bash
npx eas credentials:manager -p android
```

### 5.3 iOS Distribution Certificate & Provisioning Profile

Generate everything from any OS:

```bash
npx eas credentials -p ios
```

Interactive steps:

1. Log in to Apple Developer account when prompted.
2. Select `production` build profile.
3. Select `Generate new credentials`.
4. EAS will create:
   - iOS Distribution Certificate
   - Provisioning Profile
   - Push Notification Key (optional, if requested)

EAS automatically registers the bundle identifier `com.rejuvenation.emr` in your Apple Developer account.

### 5.4 Build commands

After credentials are configured:

```bash
# Production Android App Bundle (Play Store)
npx eas build --platform android --profile production

# Production iOS archive (App Store)
npx eas build --platform ios --profile production
```

To build both:

```bash
npx eas build --platform all --profile production
```

### 5.5 Submit commands (optional)

Once App Store Connect and Google Play service accounts are configured in `eas.json`:

```bash
npx eas submit --platform ios --profile production
npx eas submit --platform android --profile production
```

---

## Pre-submission checklist

- [ ] App Store Connect app record created with bundle ID `com.rejuvenation.emr`
- [ ] Google Play Console app created with package `com.rejuvenation.emr`
- [ ] `eas.json` submit credentials updated with real API keys
- [ ] Privacy policy URL added in both stores (required because app handles health data)
- [ ] Contact email added in both stores
- [ ] Screenshots prepared for iPhone + iPad + Android phone + Android tablet
- [ ] App icon and feature graphic uploaded
- [ ] Data safety form completed with offline-first / no-tracking answers
- [ ] Apple Privacy Manifest included (`ios/PrivacyInfo.xcprivacy`)
- [ ] Tested a release build on a physical device before submission
