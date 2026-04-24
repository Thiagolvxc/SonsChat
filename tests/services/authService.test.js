import { describe, expect, it } from 'vitest';
import { mapAuthError, formatUnknownError } from '../../src/utils/authHelpers';

describe('auth helpers', () => {
    it('maps firebase auth codes to friendly messages', () => {
        expect(mapAuthError('auth/invalid-email')).toBe('El correo no es válido.');
        expect(mapAuthError('auth/wrong-password')).toBe('Contraseña incorrecta.');
        expect(mapAuthError('unknown-code')).toBeNull();
    });

    it('formats unknown errors with config guidance when missing Firebase config', () => {
        expect(formatUnknownError({ message: 'MISSING_FIREBASE_CONFIG' })).toContain(
        'Configura Firebase'
        );
    });
});
