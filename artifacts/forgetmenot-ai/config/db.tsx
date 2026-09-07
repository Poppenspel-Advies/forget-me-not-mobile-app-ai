// This file will ONLY run on Web Browser environments
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};


// Initializes app connections securely without duplicating listeners on web reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
const webDb = getFirestore(app);

export function subscribeToLatestAnalysis(onDataReceived: (data: any) => void) {
  const q = query(
    collection(db, 'analyses'),
    orderBy('created_at', 'desc'),
    limit(1)
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        onDataReceived(docData);
      }
    },
    (error) => {
      console.error('Web database stream error:', error);
    }
  );
}
