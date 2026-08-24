import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';

// Safe initialized configuration layer setup matching your environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

/**
 * 🌟 CORE SERVICE PIPELINE: Uploads files and extracts text URL strings
 * @param localFileUri The temporary device path string (e.g., file://path/to/media.mp3)
 * @param fileType 'images' | 'audio'
 */
export const uploadMediaFile = async (localFileUri: string, fileType: 'images' | 'audio'): Promise<string | null> => {
  try {
    // Phase A: Read the binary format bytes from the native file system
    const response = await fetch(localFileUri);
    const blob = await response.blob();

    // Phase B: Assign a unique filename to prevent duplicate file overwrites
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const storageRef = ref(storage, `${fileType}/${fileName}`);

    console.log(`📤 Streaming binary bytes down to your free 5GB Firebase Storage path: ${fileType}...`);

    // Phase C: Stream data to the cloud bucket asset line
    await uploadBytes(storageRef, blob);

    // Phase D: Extract the direct CDN download URL to store inside your text database
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('🛡️ File upload successful! Direct text link extracted safely:', downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error('💥 Crash uploading binary media asset down to Firebase Storage:', error);
    return null;
  }
};
