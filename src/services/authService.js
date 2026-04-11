import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/user-not-found':
      return 'No existe una cuenta con ese correo.';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta.';
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Intenta de nuevo.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento.';
    case 'auth/operation-not-allowed':
      return 'Correo/contraseña no habilitado en Firebase (revisa Authentication).';
    default:
      return 'No se pudo completar la operación. Intenta de nuevo.';
  }
}

function wrap(fn) {
  return async (...args) => {
    if (!isFirebaseConfigured()) {
      return { ok: false, error: 'Configura Firebase en las variables EXPO_PUBLIC_FIREBASE_*.' };
    }
    try {
      const data = await fn(...args);
      return { ok: true, data };
    } catch (e) {
      const message = e?.code ? mapAuthError(e.code) : mapAuthError();
      return { ok: false, error: message };
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
