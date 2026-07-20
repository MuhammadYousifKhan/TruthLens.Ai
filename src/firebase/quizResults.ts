import { doc, getDoc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";

const XP_PER_CORRECT_ANSWER = 5;
const PERFECT_SCORE_BONUS = 20;

// XP rules (spec section 7): +5 per correct answer, +20 bonus for a perfect
// score, awarded once per lesson — a retake overwrites the saved score but
// never grants XP again.
export async function saveQuizResult(
  uid: string,
  lessonId: string,
  score: number,
  total: number
): Promise<{ isFirstCompletion: boolean; xpEarned: number }> {
  const resultRef = doc(db, "users", uid, "quizResults", lessonId);
  const existing = await getDoc(resultRef);
  const isFirstCompletion = !existing.exists();

  const batch = writeBatch(db);
  batch.set(resultRef, { score, total, completedAt: serverTimestamp() });

  const xpEarned = isFirstCompletion
    ? score * XP_PER_CORRECT_ANSWER + (score === total ? PERFECT_SCORE_BONUS : 0)
    : 0;

  if (isFirstCompletion && xpEarned > 0) {
    batch.update(doc(db, "users", uid), { xp: increment(xpEarned) });
  }

  await batch.commit();
  return { isFirstCompletion, xpEarned };
}
