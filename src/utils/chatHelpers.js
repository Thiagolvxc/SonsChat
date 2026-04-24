/**
 * Devuelve un ID de chat directo en base a dos UIDs.
 * @param {string} uidA
 * @param {string} uidB
 * @returns {string}
 */
export function getDirectChatId(uidA, uidB) {
    return [uidA, uidB].sort().join('__');
}
