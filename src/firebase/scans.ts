import { collection, doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";
import type { ScanResult } from "../utils/mockAnalyzer";

const SCAN_XP = 10;

export async function saveScanAndAwardXp(
  uid: string,
  localImageUri: string,
  storageUrl: string | undefined,
  result: ScanResult
) {
  const batch = writeBatch(db);

  const scanRef = doc(collection(db, "users", uid, "scans"));
  batch.set(scanRef, {
    // Real Storage download URL when upload succeeded, local picker URI otherwise.
    imageUrl: storageUrl ?? localImageUri,
    probability: result.probability,
    confidence: result.confidence,
    flags: result.flags,
    source: result.source ?? "offline",
    createdAt: serverTimestamp(),
  });

  const userRef = doc(db, "users", uid);
  batch.update(userRef, { xp: increment(SCAN_XP) });

  await batch.commit();
  return scanRef.id;
}
