# TruthLens.AI

TruthLens.AI is an Expo React Native app for AI-assisted fact-checking and educational verification workflows.

## Stack

- Frontend: React Native + Expo
- UI: React Native + Expo Router-style navigation patterns
- Backend / data layer: Firebase Auth, Firestore, and Storage
- App config: Expo SDK 57

## Prerequisites

Before running the app, install:

- Node.js 20+ recommended
- npm or yarn
- Expo CLI is not required for most setups; the project uses the local Expo dependency
- Android Studio / Xcode only if you want to run the app in emulators
- Expo Go on a physical device for quick mobile testing

## Install dependencies

From the project root:

```bash
npm install
```

## Run the frontend

Start the Expo development server:

```bash
npm start
```

Alternative direct command:

```bash
npx expo start
```

Then choose one of the following:

```bash
npm run android
npm run ios
npm run web
```

### Mobile quick start

- Open Expo Go on your phone
- Scan the QR code shown in the terminal
- The app will connect to the configured Firebase backend automatically

## Backend / Firebase

This repository does not include a separate Node.js/Express backend server. The app is wired to Firebase for the backend services used by the app:

- Firebase Authentication
- Firestore database
- Firebase Storage

The Firebase configuration is in:

- `src/firebase/config.ts`

If you are using the existing project, no local backend startup command is required. The app connects directly to the Firebase project configured in the app.

## Project structure

```bash
.
├── App.tsx
├── app.json
├── package.json
├── src/
│   ├── components/
│   ├── context/
│   ├── firebase/
│   ├── navigation/
│   ├── screens/
│   ├── theme/
│   └── utils/
└── README.md
```

## Useful commands

```bash
npm install
npm start
npm run android
npm run ios
npm run web
```

## Notes

- This project is configured for Expo SDK 57, so use the Expo docs for the exact versioned setup if needed.
- If a backend service is added later, the repo should include its own run instructions in this README.
