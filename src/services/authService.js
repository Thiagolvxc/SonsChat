import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';
import { formatUnknownError } from '../utils/authHelpers';

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

export const signInWithEmail = wrap(async (email, password) => {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
});

export const registerWithEmail = wrap(async (email, password, displayName) => {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
  return cred.user;
});

export const signOutUser = wrap(async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
});
