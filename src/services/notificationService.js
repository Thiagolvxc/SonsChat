import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

/**
 * Servicio para manejar notificaciones push usando Firebase Cloud Messaging.
 * Proporciona funcionalidades para inicializar, solicitar permisos, obtener token,
 * y manejar mensajes entrantes.
 */

/**
 * Inicializa el servicio de notificaciones.
 * Solicita permisos y configura los listeners para mensajes.
 */
export const initializeNotifications = async () => {
    try {
        // Solicitar permisos
        const authStatus = await messaging().requestPermission();
        const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
        console.log('Authorization status:', authStatus);
        }

        // Configurar listeners
        setupMessageListeners();
    } catch (error) {
        console.error('Error initializing notifications:', error);
    }
};

/**
 * Configura los listeners para mensajes entrantes.
 */
const setupMessageListeners = () => {
    // Listener para mensajes cuando la app está en foreground
    messaging().onMessage(async remoteMessage => {
        console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
        showNotificationAlert(remoteMessage);
    });

    // Listener para mensajes cuando la app está en background
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', JSON.stringify(remoteMessage));
    });
};

/**
 * Obtiene el token de registro FCM del dispositivo.
 * @returns {Promise<string|null>} El token FCM o null si hay error.
 */
export const getFCMToken = async () => {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
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
 * Muestra una alerta con el contenido de la notificación.
 * @param {Object} remoteMessage - El mensaje remoto recibido.
 */
const showNotificationAlert = (remoteMessage) => {
    const { title, body } = remoteMessage.notification || {};
    if (title && body) {
        Alert.alert(title, body);
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
    // Esta función es solo para demostración. En producción, usar Firebase Functions o servidor.
    console.log('Sending notification to:', token, 'Title:', title, 'Body:', body);
    // Aquí iría la lógica para enviar la notificación usando Firebase Admin SDK
};