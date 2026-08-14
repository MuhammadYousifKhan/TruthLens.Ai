import { doc, getDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";

const XP_PER_CORRECT_GUESS = 5;
const GAME_RESULT_ID = "spot_the_fake";

// Only one game today, so results live at a fixed doc id. XP is awarded only
// for the incremental improvement over the saved personal best, so replaying
// for practice doesn't farm XP.
export async function saveGameResult(
  uid: string,
  score: number,
  total: number
): Promise<{ isNewBest: boolean; xpEarned: number }> {
  const resultRef = doc(db, "users", uid, "gameResults", GAME_RESULT_ID);
  const existing = await getDoc(resultRef);
  const previousBest = existing.exists() ? Math.max((existing.data().bestScore as number) ?? 0, 0) : 0;
  const isNewBest = score > previousBest;

  const batch = writeBatch(db);
  batch.set(
    resultRef,
    {
      bestScore: Math.max(score, previousBest),
      lastScore: score,
      total,
      playedAt: serverTimestamp(),
    },
    { merge: true }
  );

  const xpEarned = isNewBest ? (score - previousBest) * XP_PER_CORRECT_GUESS : 0;
  if (xpEarned > 0) {
    batch.update(doc(db, "users", uid), { xp: increment(xpEarned) });
  }

  await batch.commit();
  return { isNewBest, xpEarned };
}
