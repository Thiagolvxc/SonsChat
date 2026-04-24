/**
 * Mapea códigos de error de Firebase Auth a mensajes de usuario.
 * @param {string} code
 * @returns {string|null}
 */
export function mapAuthError(code) {
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

/**
 * Traduce errores desconocidos de Firebase Auth a mensajes de usuario.
 * @param {any} e
 * @returns {string}
 */
export function formatUnknownError(e) {
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
