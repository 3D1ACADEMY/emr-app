# EMR Mobile App

**Clinical Emergency Management System (CEMS)** for aesthetic professionals.

Built for **3D Rejuvenation Academy | Dr. Amr Ismail, MD | www.3drejuvenationcode.com**

## Overview

Cross-platform iOS/Android emergency response app designed for use during aesthetic procedures when complications occur. The app works **offline-first** so it functions even without clinic Wi-Fi or cellular coverage.

## Features

- 🚨 **One-tap emergency activation** with protocol selection
- 💉 **Vascular Occlusion protocol** with hyaluronidase dosing calculator
- ⚠️ **Anaphylaxis protocol** with epinephrine weight-based calculator
- ⚡ **Local Anesthetic Toxicity** protocol with Intralipid guidance
- 💧 **Acute Hematoma** management checklist
- 🧊 **Vasovagal Syncope** response steps
- 🦠 **Herpes Simplex Outbreak** antiviral protocol
- 🧫 **Procedure-Related Infection** antibiotic guidance
- 🔹 **Filler Nodules / Tyndall Effect** management
- ⏱️ **Treatment timer** with vibration alerts and quick presets
- 🔒 **Biometric lock** with Face ID / Touch ID + 4-digit PIN fallback
- 👤 **Patient context** storage for allergies, meds, weight
- 📋 **Incident log** with voice dictation, photo attachments, and report preview
- 🔐 **Encrypted at rest** via `expo-secure-store`
- ⚠️ **Medico-legal disclaimer** gating on first launch
- 📈 **Clinical calculators**: Botulinum Toxin & Local Anesthetic max dose
- 🧠 **Danger Zone Atlas**: interactive facial map with artery info
- 🗺️ **Emergency Facility Locator**: offline hospital/HBOT list with distance + call button
- 🔒 **Premium content gate**: course unlock codes for advanced protocols
- ☁️ **Offline-first** local storage on device
- 📱 **EAS Build ready** for iOS/Android store submission

## Tech Stack

- React Native
- Expo SDK 49
- React Navigation
- React Native Paper
- expo-secure-store
- expo-local-authentication

## Getting Started

```bash
npm install
npx expo start
```

Then scan the QR code with:
- **iOS**: Camera app or Expo Go
- **Android**: Expo Go app

To build native binaries:
```bash
npx expo prebuild
npx expo run:ios
npx expo run:android
```

## Verified Build

Web export has been successfully built and tested:
```bash
npx expo export --platform web
```
Produces a working static bundle in `dist/`.

## Latest Preview APK

**CEMS-EMERGENCY.APK** (Android preview build)
- Download: https://expo.dev/artifacts/eas/ZsVJTwZxiGNhS7F0xfIaMKbWsewN-GbcSNNGjWDx19Y.apk
- Size: ~33 MB
- Build ID: `46162426-4f48-43e2-9293-67e7d6143c19`

## EAS Build (iOS/Android store binaries)

1. Create Expo account at https://expo.dev
2. Initialize EAS project:
   ```bash
   npx eas init
   ```
3. Build internal preview APK:
   ```bash
   npx eas build --platform android --profile preview
   ```
4. Build for App Store / Play Store:
   ```bash
   npx eas build --platform ios --profile production
   npx eas build --platform android --profile production
   ```

## Windows Dev Note

On Windows with recent Node versions, Expo CLI may fail with `ENOENT: node:sea` because it tries to create a directory containing a colon. If you see this after `npm install`, apply this one-line patch to `node_modules/@expo/cli/build/src/start/server/metro/externals.js`:

```js
// In NODE_STDLIB_MODULES filter, add:
&& !x.includes(":")
```

This skips `node:sea` (not needed for React Native apps) and allows Metro to start.

## Project Structure

```
EMR-App/
├── App.js                      # Navigation & theme setup
├── app.json                   # Expo config (iOS/Android bundle IDs)
├── src/
│   ├── components/              # Reusable UI components
│   ├── constants/               # Brand theme + emergency protocols
│   ├── screens/                 # App screens
│   └── utils/                   # Storage & helpers
└── assets/                    # Icons, splash, branding
```

## Store Submission

See [`STORE_SUBMISSION.md`](./STORE_SUBMISSION.md) for the complete App Store / Play Store checklist, EAS credentials setup, iOS Privacy Manifest, and Google Play Data Safety answers.

## Brand

Uses the 3D Rejuvenation Academy color palette:
- Navy background: `#0b0e17`
- Gold accent: `#D4AF37`
- Teal active state: `#56d6c4`
- Warm off-white text: `#f3ede0`

## License

Proprietary — 3D Rejuvenation Academy
