import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./config";

function guessExtension(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(uri);
  return match ? match[1].toLowerCase() : "jpg";
}

// A hard ceiling on the whole upload, independent of the SDK's own retry budget
// (capped in ./config). Storage is optional to the scan flow, so a slow or
// blocked upload must never hold the Analyzing screen hostage.
const UPLOAD_TIMEOUT_MS = 10000;

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
    const timer = setTimeout(() => {
      // cancel() re-enters the error callback below, but the promise has already
      // settled by then, so the second reject is a no-op.
      task.cancel();
      reject(new Error(`Upload exceeded ${UPLOAD_TIMEOUT_MS}ms`));
    }, UPLOAD_TIMEOUT_MS);

    task.on(
      "state_changed",
      undefined,
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
      () => {
        clearTimeout(timer);
        resolve();
      }
    );
  });

  return getDownloadURL(storageRef);
}
