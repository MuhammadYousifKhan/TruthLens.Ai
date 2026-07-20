import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

type UserProfile = {
  name: string;
  email: string;
  xp: number;
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      const data = snapshot.data();
      setProfile(data ? { name: data.name, email: data.email, xp: data.xp ?? 0 } : null);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { profile, loading };
}
