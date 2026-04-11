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
    case 'auth/admin-restricted-operation':
      return 'Registro deshabilitado por políticas del proyecto (Firebase Console → Authentication).';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'API key de Firebase no válida. Copia de nuevo la clave web del proyecto (sin espacios), revisa el .env y en Google Cloud → Credenciales comprueba restricciones de la clave (Identity Toolkit API).';
    case 'auth/app-not-authorized':
      return 'Esta app no está autorizada para usar Firebase con esa clave.';
    case 'auth/invalid-app-credential':
      return 'Credencial de app inválida. Revisa que el appId y la API key correspondan al mismo proyecto.';
    case 'auth/configuration-not-found':
      return 'Configuración de Auth no encontrada. Activa Authentication en Firebase y el método correo/contraseña.';
    case 'auth/internal-error':
      return 'Error interno de Firebase. Suele deberse a clave API restringida: en Google Cloud → Credenciales, permite Identity Toolkit API o quita restricciones para probar.';
    case 'auth/missing-email':
      return 'Falta el correo electrónico.';
    case 'auth/missing-password':
      return 'Falta la contraseña.';
    case 'auth/invalid-password':
      return 'La contraseña no cumple las reglas del proyecto (longitud o complejidad).';
    default:
      return null;
  }
}

function formatUnknownError(e) {
  let code = typeof e?.code === 'string' ? e.code.trim() : null;
  if (code?.endsWith('.')) code = code.slice(0, -1);
  if (code?.includes('api-key-not-valid')) {
    code = 'auth/api-key-not-valid.-please-pass-a-valid-api-key.';
  }
  const mapped = code ? mapAuthError(code) : null;
  if (mapped) return mapped;

  if (e?.message === 'MISSING_FIREBASE_CONFIG' || String(e?.message || '').includes('MISSING_FIREBASE_CONFIG')) {
    return 'Configura Firebase en las variables EXPO_PUBLIC_FIREBASE_* y reinicia con npx expo start --clear.';
  }

  if (typeof __DEV__ !== 'undefined' && __DEV__ && code) {
    return `Error de autenticación (${code}). Revisa la consola y Firebase Authentication.`;
  }

  return 'No se pudo completar la operación. Intenta de nuevo.';
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

export const signOutUser = wrap(async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
});
