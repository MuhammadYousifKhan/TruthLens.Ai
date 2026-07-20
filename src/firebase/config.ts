import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-expect-error — getReactNativePersistence exists at runtime (Metro resolves the RN
// build of firebase/auth) but is absent from the package's non-conditional shared .d.ts.
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase web config — not a secret, security lives in Firestore/Storage rules (spec section 9).
// Replace the placeholder values below with your project's config from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyC7hURQQqZ5-i3u7tWM5WlQtnoGCmFDPCY",
  authDomain: "truthlens-ai-123.firebaseapp.com",
  projectId: "truthlens-ai-123",
  storageBucket: "truthlens-ai-123.firebasestorage.app",
  messagingSenderId: "377073471068",
  appId: "1:377073471068:web:7b669bd8d356487e7c6099",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
