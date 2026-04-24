import { describe, expect, it } from 'vitest';
import { normalizeFirebaseConfig } from '../../src/utils/firebaseHelpers';

describe('firebase helpers', () => {
    it('normalizes firebase config values without quotes and spaces', () => {
        const raw = {
        apiKey: ' "abc123" ',
        authDomain: "'example.firebaseapp.com'",
        projectId: ' test-project ',
        nullable: null,
        };
        const normalized = normalizeFirebaseConfig(raw);

        expect(normalized).toEqual({
        apiKey: 'abc123',
        authDomain: 'example.firebaseapp.com',
        projectId: 'test-project',
        });
    });

    it('returns an empty object for invalid config', () => {
        expect(normalizeFirebaseConfig(null)).toEqual({});
        expect(normalizeFirebaseConfig(undefined)).toEqual({});
        expect(normalizeFirebaseConfig('string')).toEqual({});
    });
});
