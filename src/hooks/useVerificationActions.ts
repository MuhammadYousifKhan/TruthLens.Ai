import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export function useVerificationActions() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, "users", user.uid, "actions"), (snapshot) => {
      setCount(snapshot.size);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { count, loading };
}
