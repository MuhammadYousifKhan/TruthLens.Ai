import { doc, getDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";

const VERIFICATION_ACTION_XP = 5;

export type VerificationActionType = "checklist_completed" | "chose_verify_first";

// Rewards behavior (verifying before sharing), not screen time — spec v2 4.8.
// Idempotent per action type per day: the doc id is deterministic
// (type-YYYY-MM-DD), so re-triggering the same action again today is a no-op
// rather than farmable XP.
export async function awardVerificationActionXp(
  uid: string,
  type: VerificationActionType
): Promise<boolean> {
  const dateKey = new Date().toISOString().slice(0, 10);
  const actionRef = doc(db, "users", uid, "actions", `${type}-${dateKey}`);

  const existing = await getDoc(actionRef);
  if (existing.exists()) return false;

  const batch = writeBatch(db);
  batch.set(actionRef, {
    type,
    xpAwarded: VERIFICATION_ACTION_XP,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "users", uid), { xp: increment(VERIFICATION_ACTION_XP) });
  await batch.commit();
  return true;
}
