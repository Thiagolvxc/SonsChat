import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

let authInstance = null;
let firestoreInstance = null;
let devConfigLogged = false;

function normalizeFirebaseConfig(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v == null) continue;
    let s = String(v).replace(/^\uFEFF/, '').trim();
    for (let i = 0; i < 4; i += 1) {
      if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
      ) {
        s = s.slice(1, -1).trim();
      } else break;
    }
    out[k] = s;
  }
  return out;
}

export function getFirebaseConfig() {
  return normalizeFirebaseConfig(Constants.expoConfig?.extra?.firebase ?? {});
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
  const cfg = getFirebaseConfig();
  if (getApps().length === 0) {
    if (typeof __DEV__ !== 'undefined' && __DEV__ && !devConfigLogged) {
      devConfigLogged = true;
      const k = cfg.apiKey || '';
      console.warn(
        '[firebase] apiKey cargada: longitud',
        k.length,
        k ? `, inicio "${k.slice(0, 8)}…"` : '(vacía)'
      );
    }
    return initializeApp(cfg);
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
        persistence: getReactNativePersistence(AsyncStorage),
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

export function getFirestoreDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('MISSING_FIREBASE_CONFIG');
  }
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}
