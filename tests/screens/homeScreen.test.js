import { describe, expect, it } from 'vitest';
import { chatTitle, formatPreview } from '../../src/utils/uiHelpers';

describe('HomeScreen utilities', () => {
    it('chooses a title from memberTitles when available', () => {
        const chat = { participantIds: ['a', 'b'], memberTitles: { b: 'Amigo' } };
        expect(chatTitle(chat, 'a')).toBe('Amigo');
    });

    it('falls back to uid suffix when title is not in memberTitles', () => {
        const chat = { participantIds: ['a', 'b'], memberTitles: {} };
        expect(chatTitle(chat, 'a')).toBe('Usuario b');
    });

    it('formats message preview for today and older dates', () => {
        const now = Math.floor(Date.now() / 1000);
        const today = formatPreview({ seconds: now });
        expect(today.length).toBeGreaterThan(0);

        const oldDay = formatPreview({ seconds: 1609459200 });
        expect(oldDay.length).toBeGreaterThan(0);
        expect(oldDay).not.toBe(today);
    });
});
