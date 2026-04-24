import { describe, expect, it } from 'vitest';
import { formatTime } from '../../src/utils/uiHelpers';

describe('ChatScreen utilities', () => {
    it('returns empty string for missing timestamp', () => {
        expect(formatTime(null)).toBe('');
    });

    it('formats a valid timestamp as time string', () => {
        const ts = { seconds: 1672531200 };
        const formatted = formatTime(ts);
        expect(formatted.length).toBeGreaterThan(0);
    });
});
