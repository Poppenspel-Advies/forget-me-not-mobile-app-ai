# 🌌 ForgetMeNot AI — Predictive Context Intelligence Engine

ForgetMeNot AI is a high-fidelity, cross-platform mobile and web application built with **React Native (Expo)** and powered by **Firebase** and **Google Gemini Pro**. The application functions as an immersive, context-aware secondary memory brain that tracks anomalies, bridges predictive informational gaps, and converts ambient predictive metadata into actionable human blueprints.

---

## 🎯 Complete Application Feature Index

*   **Predictive Context Loop Analyzer:** Hooks directly into Google Gemini Pro to parse captured notes, files, and thoughts into structured metadata anomaly records, mapping situational risks automatically.
*   **Immersive Audio-Visual Login Gate:** A high-fidelity, web-hardened authentication screen displaying a live continuous streaming space background video (`Planet_Galaxy.mp4`) backed by deep ambient acoustic soundscapes (`cosmic-ambient-void.mp3`).
*   **Multi-Tier Identity Security Guard:** Integrates full dual-stage verification workflows. Supports Email/Password user creation, account login, automated remote password resets, and locks structural access behind a 4-digit database-synced quick-entry PIN card.
*   **Real-Time Firestore Matrix Telemetry:** Utilizes reactive onSnapshot sockets to calculate signal logs, update user profile parameters, and bind interface toggles cleanly across client sessions without layout freeze bugs.
*   **Responsive Glassmorphic UI/UX Engine:** Hand-tailored CSS grid styles and flex bounds optimized for native screens and Expo Web viewports, featuring spinning logo controllers, focus glow input inputs, and anti-clipping padding offsets.

---

## 🛠️ Tech Stack & Infrastructure Architecture

*   **Framework Architecture:** React Native / Expo (v6 SDK Router Router Core)
*   **Cloud Infrastructure Database:** Firebase Auth & Cloud Firestore Real-time Database
*   **Intelligence Model API:** Google Gemini Pro Integration Pipeline
*   **Hardware Media Controller:** Expo Audio-Visual Streaming Kit (`expo-av`)
*   **Design Token Matrix:** Custom Cyber-Glassmorphic Dark Mode Theme (Neon Magenta, Fluorescent Cyan, Cosmic Void Black)

---

## 📋 Comprehensive Component Props Matrix Table

| Component Name | File Path Source Target | Prop Key | Prop Type | Required? | Functional Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`LoginGateScreen`** | `app/index.tsx` | `onAuthComplete` | `(userId: string) => void` | **Yes** | Triggered upon successful passcode validation; passes the verified user UID token back to the root router switchboard. |
| **`ProfileScreen`** | `app/index.tsx` | `onNavigate` | `(screen: Screen) => void` | **Yes** | Updates navigation state context. Intercepts `home` target triggers to securely wipe current session data values during user logouts. |
| **`HomeScreen`** | `app/index.tsx` | `onNavigate` | `(screen: Screen) => void` | **Yes** | Reroutes user coordinates from active hub cards into sub-level metrics view screens. |
| | | `captured` | `CapturedItem[]` | **Yes** | Feeds an array listing locally saved text, note, and image signal markers into the chronological timeline component block. |
| **`ScreenHeader`** | `app/index.tsx` | `title` | `string` | **Yes** | Displays target text header title inside top navbar elements. |
| | | `subtitle` | `string` | No | Renders a subtext layout description or active user session email string address underneath the main title text. |
| | | `onBack` | `() => void` | No | If supplied, mounts a backward arrow chevron icon button to navigate back up a frame layout. |
| | | `right` | `React.ReactNode` | No | Injectable space container used to pass custom asset icons or operational control buttons into the right navbar slot. |
| **`SectionTitle`** | `app/index.tsx` | `eyebrow` | `string` | No | Standard high-contrast, mini text readout marker summarizing sub-classification paths. |
| | | `title` | `string` | **Yes** | Sets primary horizontal subsection title description. |
| | | `action` | `string` | No | Formats selectable textual text shortcuts links on the trailing border block. |
| | | `onAction` | `() => void` | No | Execution callback callback handler for the trailing header shortcut link elements. |
| **`PredictionCard`** | `app/index.tsx` | `item` | `any` | **Yes** | Object containing title strings, category indicators, threat probability rates, and color hex keys fetched from Firestore. |
| | | `onPress` | `() => void` | **Yes** | Route controller fired when user selects an active signal component card block. |

---

## ⚡ Deployment & Quick-Start Execution

### 1. Prerequisites Setup
Ensure your local environment runs Node.js (v18+) and your package architecture runs **pnpm** or **npm**.

### 2. Configure Environment Secrets
Create a `.env` file at the root of the project structure and populate it with your cloud endpoint keys and API tokens:
```env
# --- FIREBASE CORE ENDPOINTS ---
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=://firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=forgetmenot-ai
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=://appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
EXPO_PUBLIC_FIREBASE_APP_ID=1:12345:web:abcde

# --- THIRD PARTY CORE SERVICE API INTELLIGENCE ---
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyGeminiCoreKey...
EXPO_PUBLIC_OPENWEATHER_API_KEY=55e7bc...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyMapsCoreKey...
```

### 3. Install Package Bundles
If running a Windows terminal command viewport shell, bypass Linux-specific script execution constraints securely using:
```bash
pnpm install --ignore-scripts
```

### 4. Build and Fire Up Metro Server
Initiate a clean file structure crawl by executing:
```bash
npx expo start --clear
```
*   Press **`w`** to view on an interactive web canvas viewport browser grid.
*   Press **`r`** inside your active server prompt window to refresh compilation cache lines.

---

## 🖥️ Local Firebase Emulator Suite Installation

To run, test, and debug database transactions locally without impacting your live cloud production environment records, install and fire up the local standalone Firebase toolkit:

### 1. Install Firebase CLI Globally
```bash
npm install -g firebase-tools
```

### 2. Authenticate the CLI with Your Account
```bash
firebase login
```

### 3. Initialize the Local Workspace Configurations
Run this from your root project directory and select `Firestore` and `Authentication` when prompted:
```bash
firebase init emulators
```

### 4. Fire Up the Local Emulator Suite
```bash
firebase emulators:start
```
Once active, your local UI management panel tracks will build and stream on `http://localhost:4000`.

---

## 📹 Video Background Application Requirements

To avoid web-rendering lag or stuttering frame drops during authentication loops, ensure your workspace setup adheres to the following media parameters:

*   **Format Constraints:** The cinematic assets folder must contain an explicit **H.264 encoded `.mp4` container file**. Higher profile formats like HEVC/H.265 are natively rejected by most desktop browsers.
*   **Web Playback Policy:** Desktop viewports (Chrome, Safari, Edge) strictly forbid video auto-play streams unless the component is forced to initialization state under an explicit **`isMuted={true}`** property flag. Audio loops must follow the async `Audio.Sound` pipeline separately.
*   **Hardware Codec Acceleration:** For optimal canvas scaling, your **`metro.config.js`** must be configured to append and pass down binary asset allocations:
    ```javascript
    config.resolver.assetExts.push('mp4');
    ```

---

## 📊 API & Database Response Schema (`/analyses` Collection)

The system records real-time cognitive timeline telemetry models inside Firestore documents using this specific nested JSON structure:

```json
{
  "document_id": "an29Fj831kLdM0429sXz",
  "user_id": "Admin_ForgetMeNotAI",
  "title": "Train to Central Departure Window",
  "detail": "Inferred from recent calendar snapshot logs and a captured travel schedule photo.",
  "tag": "PLACES",
  "created_at": "2026-09-11T12:24:00.000Z",
  "analysis": {
    "signal": "Train to Central Departure Window",
    "explanation": "Routine data routes trace an absolute variance conflict grid between your local schedule and departure slots.",
    "confidence": 94,
    "categoryTag": "PLACES",
    "dependencyNodesCount": "5"
  }
}
```

---

## 🔐 Cloud Firestore Security Rules Configuration
To allow users to register and modify their own credentials safely without database sync blocks, update your **Cloud Firestore Rules** tab in your online console to match this matrix schema:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📜 Licensing & Legal Registry
FORGETMENOT AI Core System · Distributed under the terms of the **MIT License**. Created by Arpit & The ForgetMeNot Developer Team.
