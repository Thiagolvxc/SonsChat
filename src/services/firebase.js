import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const storage = createAsyncStorage('sonschat-firebase-auth');

let authInstance = null;

export function getFirebaseConfig() {
  return Constants.expoConfig?.extra?.firebase ?? {};
}

export function isFirebaseConfigured() {
  const c = getFirebaseConfig();
  return Boolean(
    c.apiKey &&
    c.authDomain &&
    c.projectId &&
    c.storageBucket &&
    c.messagingSenderId &&
    c.appId
  );
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error('MISSING_FIREBASE_CONFIG');
  }
  if (getApps().length === 0) {
    return initializeApp(getFirebaseConfig());
  }
  return getApps()[0];
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) {
    throw new Error('MISSING_FIREBASE_CONFIG');
  }
  if (!authInstance) {
    const app = getFirebaseApp();
    try {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(storage),
      });
    } catch (e) {
      if (e?.code === 'auth/already-initialized') {
        authInstance = getAuth(app);
      } else {
        throw e;
      }
    }
  }
  return authInstance;
}
