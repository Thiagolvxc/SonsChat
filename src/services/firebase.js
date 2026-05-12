import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { normalizeFirebaseConfig } from '../utils/firebaseHelpers';

let authInstance = null;

function getFirebaseConfig() {
  const extra = Constants.expoConfig?.extra ?? Constants.manifest2?.extra ?? Constants.manifest?.extra ?? {};
  const firebase = extra.firebase ?? {};
  return normalizeFirebaseConfig({
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    ...firebase,
  });
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.storageBucket &&
    config.messagingSenderId &&
    config.appId
  );
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado correctamente.');
  }

  const config = getFirebaseConfig();
  if (getApps().length === 0) {
    return initializeApp(config);
  }

  return getApps()[0];
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado correctamente.');
  }

  if (!authInstance) {
    const app = getFirebaseApp();
    const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';

    if (isWeb) {
      authInstance = getAuth(app);
    } else {
      try {
        authInstance = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (error) {
        if (error.code === 'auth/already-initialized') {
          authInstance = getAuth(app);
        } else {
          throw error;
        }
      }
    }
  }

  return authInstance;
}

let firestoreInstance = null;
export function getFirestoreDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase no está configurado correctamente.');
  }

  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }

  return firestoreInstance;
}
