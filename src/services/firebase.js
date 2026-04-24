import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { normalizeFirebaseConfig } from '../utils/firebaseHelpers';

let authInstance = null;
let firestoreInstance = null;
let devConfigLogged = false;

/**
 * Devuelve la configuración de Firebase lista para inicializar la app.
 * @returns {Record<string, string>}
 */
export function getFirebaseConfig() {
  return normalizeFirebaseConfig(Constants.expoConfig?.extra?.firebase ?? {});
}

/**
 * Comprueba si hay suficiente configuración de Firebase para inicializar los servicios.
 * @returns {boolean}
 */
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

/**
 * Inicializa o devuelve la instancia de autenticación de Firebase.
 * @returns {object}
 */
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

/**
 * Inicializa o devuelve la instancia de Firestore.
 * @returns {object}
 */
export function getFirestoreDb() {
  if (!isFirebaseConfigured()) {
    throw new Error('MISSING_FIREBASE_CONFIG');
  }
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}
