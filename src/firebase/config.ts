import { Platform } from "react-native";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// @ts-expect-error — getReactNativePersistence exists at runtime (Metro resolves the RN
// build of firebase/auth on native) but is absent from the package's non-conditional shared .d.ts.
import { getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase web config — not a secret, security lives in Firestore/Storage rules (spec section 9).
const firebaseConfig = {
  apiKey: "AIzaSyC7hURQQqZ5-i3u7tWM5WlQtnoGCmFDPCY",
  authDomain: "truthlens-ai-123.firebaseapp.com",
  projectId: "truthlens-ai-123",
  storageBucket: "truthlens-ai-123.firebasestorage.app",
  messagingSenderId: "377073471068",
  appId: "1:377073471068:web:7b669bd8d356487e7c6099",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Native builds get AsyncStorage-backed persistence; on the web target, "firebase/auth"
// resolves to the browser bundle, which has no getReactNativePersistence export at all —
// getAuth() there already persists to the browser's own storage by default.
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
export const storage = getStorage(app);

// The SDK defaults are 10 minutes for uploads and 2 for everything else, and it
// treats a blocked CORS preflight as a retryable network error — so on web an
// upload that can never succeed still burns the full backoff before rejecting,
// freezing the Analyzing screen on stage 0. The scan flow degrades gracefully
// without Storage, so failing fast is strictly better than retrying for minutes.
storage.maxUploadRetryTime = 8000;
storage.maxOperationRetryTime = 8000;

export default app;
