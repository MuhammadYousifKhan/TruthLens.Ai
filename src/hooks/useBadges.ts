import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export function useBadges() {
  const { user } = useAuth();
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEarnedIds(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "badges"), (snapshot) => {
      setEarnedIds(new Set(snapshot.docs.map((docSnapshot) => docSnapshot.id)));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { earnedIds, loading };
}
