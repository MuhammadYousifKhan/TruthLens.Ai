import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./config";

export async function createUserDocument(uid: string, name: string, email: string) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    xp: 0,
    createdAt: serverTimestamp(),
    lastActiveDate: new Date().toISOString().slice(0, 10),
  });
}
