import { describe, expect, it } from 'vitest';
import { getDirectChatId } from '../../src/utils/chatHelpers';

describe('chat helpers', () => {
    it('returns a deterministic direct chat id regardless of uid order', () => {
        expect(getDirectChatId('userB', 'userA')).toBe(getDirectChatId('userA', 'userB'));
        expect(getDirectChatId('abc', 'xyz')).toBe('abc__xyz');
    });
});
