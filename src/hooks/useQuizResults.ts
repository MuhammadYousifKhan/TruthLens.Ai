import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export type QuizResult = {
  score: number;
  total: number;
};

// Keyed by lessonId — a lesson is "complete" when its doc exists here.
export function useQuizResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<Record<string, QuizResult>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setResults({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "quizResults"),
      (snapshot) => {
        const next: Record<string, QuizResult> = {};
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          next[docSnapshot.id] = { score: data.score, total: data.total };
        });
        setResults(next);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  return { results, loading };
}
