# QR Toolkit 📱✨

A modern, fast, and feature-packed React Native app built with **Expo**, **Expo Router**, **TypeScript**, and **NativeWind (Tailwind CSS)**. QR Toolkit allows users to easily scan, generate, customize, and save QR codes with local storage history.

---

## 🚀 Features

- **📷 Fast QR Code Scanner**: Scan QR codes instantly using `expo-camera` with torch/flash toggle and real-time haptic feedback.
- **🎨 Custom QR Code Generator**: Generate QR codes for:
  - Plain Text & Web URLs
  - Wi-Fi Networks (SSID, Password, Encryption type)
  - Emails & Phone Numbers
  - Custom QR Colors & Styles
- **📜 History & Favorites**: Local storage powered by `@react-native-async-storage/async-storage`. Filter by scanned or generated QR codes.
- **📤 Easy Sharing & Copying**: Copy generated or scanned payloads to clipboard or trigger native system sharing.
- **⚡ NativeWind (Tailwind CSS v4)**: Styled with modern design systems and smooth micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 57) + [React Native](https://reactnative.dev)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based Routing)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
- **Icons**: [lucide-react-native](https://lucide.dev)
- **QR Engine**: [react-native-qrcode-svg](https://github.com/alexeybx/react-native-qrcode-svg)
- **Package Manager**: [Bun](https://bun.sh/)

---

## 📦 Getting Started

### Prerequisites

Ensure you have **Bun** and **Node.js** installed on your system.

```bash
# Verify Bun installation
bun --version
```

### Installation

1. Clone the repository and navigate into the directory:

   ```bash
   cd "QR Toolkit"
   ```

2. Install dependencies with **Bun**:
   ```bash
   bun install
   ```

---

## 🏃 Run Commands (using Bun)

| Command                  | Action                                             |
| :----------------------- | :------------------------------------------------- |
| `bun dev` or `bun start` | Start the Expo development server                  |
| `bun android`            | Start the app on connected Android device/emulator |
| `bun ios`                | Start the app on iOS Simulator                     |
| `bun web`                | Start the app in Web browser                       |
| `bun run lint`           | Run ESLint code checks                             |
| `bun run lint:fix`       | Fix ESLint issues automatically                    |
| `bun run format`         | Format code with Prettier                          |
| `bun run format:check`   | Check code formatting with Prettier                |

---

## 🏗️ Local EAS Builds (APK / AAB / IPA)

Build native release packages directly on your local machine using EAS CLI (requires Android SDK for Android builds, and Xcode on macOS for iOS builds):

| Output Format     | Command                 | Description                                                         |
| :---------------- | :---------------------- | :------------------------------------------------------------------ |
| **Android APK**   | `bun run build:apk`     | Generates a standalone `.apk` file for direct installation          |
| **Android AAB**   | `bun run build:aab`     | Generates an `.aab` (App Bundle) ready for Google Play Store upload |
| **iOS IPA**       | `bun run build:ipa`     | Generates an `.ipa` package for iOS (requires Xcode/macOS)          |
| **iOS Simulator** | `bun run build:ios-sim` | Generates a simulator build (`.app` tarball) for iOS Simulator      |

---

## 📁 Project Structure

```text
QR Toolkit/
├── app/                  # Expo Router file-based pages
│   ├── (tabs)/           # Main tab screens (Home, Scan, Generate, History)
│   └── _layout.tsx       # Root layout & global CSS import
├── components/           # Reusable UI components
├── constants/            # Design tokens & color constants
├── hooks/                # Custom React hooks (useHistory, etc.)
├── services/             # Business logic (QR detection, storage, formats)
├── types/                # TypeScript interface definitions
├── global.css            # Tailwind CSS directives
├── metro.config.js       # Metro configuration for NativeWind
├── babel.config.js       # Babel configuration for Expo & NativeWind
└── package.json          # Dependencies & npm/bun scripts
```

---

## 📝 License

This project is open-source under the [ISC License](LICENSE).
