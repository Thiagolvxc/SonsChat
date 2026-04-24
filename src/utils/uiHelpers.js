/**
 * Devuelve el título de chat para mostrar en la lista de conversaciones.
 * @param {{participantIds?: Array<string>, memberTitles?: Record<string, string>}} chat
 * @param {string} myUid
 * @returns {string}
 */
export function chatTitle(chat, myUid) {
    const other = chat.participantIds?.find((id) => id !== myUid);
    const titles = chat.memberTitles || {};
    if (other && titles[other]) return titles[other];
    if (other) return `Usuario ${other.slice(-4)}`;
    return 'Chat';
}

/**
 * Formatea la hora del último mensaje para la lista de chats.
 * @param {{seconds?: number}} ts
 * @returns {string}
 */
export function formatPreview(ts) {
    if (!ts?.seconds) return '';
    const d = new Date(ts.seconds * 1000);
    const now = new Date();
    const sameDay =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
    if (sameDay) {
        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/**
 * Formatea la marca de tiempo de un mensaje para mostrarla en el chat.
 * @param {{seconds?: number}} ts
 * @returns {string}
 */
export function formatTime(ts) {
    if (!ts?.seconds) return '';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
