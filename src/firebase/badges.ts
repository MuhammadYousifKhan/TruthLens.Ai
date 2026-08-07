import { collection, doc, getDocs, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "./config";
import { lessons } from "../data/lessons";

const TOTAL_LESSONS = lessons.length;
const PASS_RATIO = 0.6;

// Badge checks run after every scan save and quiz result write (spec section 7).
// Returns the ids of any badges newly earned by this check so the caller can
// show a celebratory dialog.
export async function checkAndAwardBadges(uid: string): Promise<string[]> {
  const [scansSnap, quizResultsSnap, gameResultsSnap, badgesSnap] = await Promise.all([
    getDocs(collection(db, "users", uid, "scans")),
    getDocs(collection(db, "users", uid, "quizResults")),
    getDocs(collection(db, "users", uid, "gameResults")),
    getDocs(collection(db, "users", uid, "badges")),
  ]);

  const alreadyEarned = new Set(badgesSnap.docs.map((d) => d.id));
  const quizResults = quizResultsSnap.docs.map(
    (d) => d.data() as { score: number; total: number }
  );
  const gameResults = gameResultsSnap.docs.map(
    (d) => d.data() as { bestScore: number; total: number }
  );

  const newlyEarned: string[] = [];

  if (!alreadyEarned.has("first_look") && scansSnap.size >= 1) {
    newlyEarned.push("first_look");
  }
  if (
    !alreadyEarned.has("fact_finder") &&
    quizResults.some((r) => r.total > 0 && r.score / r.total >= PASS_RATIO)
  ) {
    newlyEarned.push("fact_finder");
  }
  if (!alreadyEarned.has("truth_seeker") && quizResultsSnap.size >= TOTAL_LESSONS) {
    newlyEarned.push("truth_seeker");
  }
  if (!alreadyEarned.has("sharp_eye") && quizResults.some((r) => r.total > 0 && r.score === r.total)) {
    newlyEarned.push("sharp_eye");
  }
  if (
    !alreadyEarned.has("sharp_spotter") &&
    gameResults.some((r) => r.total > 0 && r.bestScore === r.total)
  ) {
    newlyEarned.push("sharp_spotter");
  }

  if (newlyEarned.length === 0) return [];

  const batch = writeBatch(db);
  newlyEarned.forEach((badgeId) => {
    batch.set(doc(db, "users", uid, "badges", badgeId), { earnedAt: serverTimestamp() });
  });
  await batch.commit();

  return newlyEarned;
}
