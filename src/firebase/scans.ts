import { collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";
import type { ScanResult } from "../utils/mockAnalyzer";

const SCAN_XP = 10;

// Storage is stubbed for now (billing card not yet set up — spec section 13 risk
// mitigation): imageUrl holds the local picker URI instead of a Storage download
// URL until upload is retrofitted.
export async function saveScanAndAwardXp(uid: string, imageUri: string, result: ScanResult) {
  const batch = writeBatch(db);

  const scanRef = doc(collection(db, "users", uid, "scans"));
  batch.set(scanRef, {
    imageUrl: imageUri,
    probability: result.probability,
    confidence: result.confidence,
    flags: result.flags,
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", uid);
  batch.update(userRef, { xp: increment(SCAN_XP) });

  await batch.commit();
  return scanRef.id;
}
