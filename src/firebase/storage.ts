import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./config";

function guessExtension(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(uri);
  return match ? match[1].toLowerCase() : "jpg";
}

// Uploads a local picker URI to Storage at scans/{uid}/{filename} and returns
// its public download URL. Requires Blaze billing to be enabled on the
// Firebase project — until then this rejects and callers should fall back to
// the local URI.
export async function uploadScanImageAsync(uid: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${guessExtension(localUri)}`;
  const storageRef = ref(storage, `scans/${uid}/${filename}`);

  const task = uploadBytesResumable(storageRef, blob, {
    contentType: blob.type || "image/jpeg",
  });

  await new Promise<void>((resolve, reject) => {
    task.on("state_changed", undefined, reject, () => resolve());
  });

  return getDownloadURL(storageRef);
}
