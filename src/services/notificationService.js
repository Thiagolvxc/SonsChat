import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

/**
 * Servicio de notificaciones simplificado.
 * No depende de @react-native-firebase/messaging para evitar errores de bundle.
 */

/**
 * Obtiene el token FCM de un usuario desde Firestore.
 * @param {string} uid - ID del usuario.
 * @returns {Promise<string|null>} El token FCM o null si no existe.
 */
export const getUserFCMToken = async (uid) => {
    try {
        const db = getFirestoreDb();
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data().fcmToken || null;
        }
        return null;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};

/**
 * Guarda el token FCM en el perfil del usuario en Firestore.
 * @param {string} uid - ID del usuario.
 * @param {string} token - Token FCM.
 * @returns {Promise<void>}
 */
export const saveFCMToken = async (uid, token) => {
    try {
        const db = getFirestoreDb();
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            fcmToken: token,
        });
        console.log('FCM Token saved for user:', uid);
    } catch (error) {
        console.error('Error saving FCM token:', error);
    }
};

/**
 * Envía una notificación push a un token específico.
 * Nota: En producción, esto debería hacerse desde el servidor usando Firebase Admin SDK.
 * @param {string} token - El token FCM del destinatario.
 * @param {string} title - El título de la notificación.
 * @param {string} body - El cuerpo de la notificación.
 */
export const sendNotification = async (token, title, body) => {
    console.log('Sending notification to:', token, 'Title:', title, 'Body:', body);
    // En esta app de ejemplo no hay envío real desde cliente.
};
