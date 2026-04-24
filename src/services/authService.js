import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import { formatUnknownError, mapAuthError } from '../utils/authHelpers';

/**
 * Envuelve una llamada a la API de Firebase Auth para devolver un resultado estándar.
 * @param {Function} fn
 * @returns {Function}
 */
function wrap(fn) {
  return async (...args) => {
    if (!isFirebaseConfigured()) {
      return { ok: false, error: 'Configura Firebase en las variables EXPO_PUBLIC_FIREBASE_*.' };
    }
    try {
      const data = await fn(...args);
      return { ok: true, data };
    } catch (e) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[authService]', e?.code, e?.message, e);
      }
      return { ok: false, error: formatUnknownError(e) };
    }
  };
}

/**
 * Inicia sesión con correo y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export const signInWithEmail = wrap(async (email, password) => {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
});

/**
 * Registra un usuario nuevo con correo, contraseña y nombre opcional.
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<object>}
 */
export const registerWithEmail = wrap(async (email, password, displayName) => {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    try {
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (profileErr) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[authService] updateProfile omitido:', profileErr?.code, profileErr?.message);
      }
    }
  }
  return cred.user;
});

/**
 * Cierra sesión del usuario actual en Firebase.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export const signOutUser = wrap(async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
});
