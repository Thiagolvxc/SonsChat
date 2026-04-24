import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getFirestoreDb } from './firebase';
import { getDirectChatId } from '../utils/chatHelpers';
import { getUserFCMToken, sendNotification } from './notificationService';
import { uploadImage, uploadAudio } from './mediaService';

/**
 * Garantiza que el perfil del usuario exista en Firestore.
 * @param {{uid?: string, displayName?: string, email?: string}} authUser
 * @returns {Promise<void>}
 */
export async function ensureUserProfile(authUser) {
  if (!authUser?.uid) return;
  const db = getFirestoreDb();
  const ref = doc(db, 'users', authUser.uid);
  await setDoc(
    ref,
    {
      displayName: authUser.displayName || '',
      email: authUser.email || '',
      emailLower: (authUser.email || '').toLowerCase(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Busca usuarios en Firestore cuyo correo comienza por un prefijo.
 * @param {string} currentUid
 * @param {string} emailPrefix
 * @returns {Promise<Array<Record<string, any>>>}
 */
export async function searchUsersByEmailPrefix(currentUid, emailPrefix) {
  const term = emailPrefix.trim().toLowerCase();
  if (term.length < 2) return [];
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'users'),
    where('emailLower', '>=', term),
    where('emailLower', '<=', `${term}\uf8ff`),
    limit(15)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== currentUid);
}

/**
 * @param {{ uid: string, displayName?: string }} me
 * @param {{ uid: string, displayName?: string }} other
 */
/**
 * Crea o recupera un chat directo entre dos usuarios.
 * @param {{uid: string, displayName?: string}} me
 * @param {{uid: string, displayName?: string}} other
 * @returns {Promise<string>}
 */
export async function getOrCreateDirectChat(me, other) {
  const chatId = getDirectChatId(me.uid, other.uid);
  const db = getFirestoreDb();
  const chatRef = doc(db, 'chats', chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      participantIds: [me.uid, other.uid].sort(),
      memberTitles: {
        [me.uid]: me.displayName?.trim() || 'Yo',
        [other.uid]: other.displayName?.trim() || 'Usuario',
      },
      lastMessageText: '',
      lastMessageAt: serverTimestamp(),
      lastReadAt: {},
      createdAt: serverTimestamp(),
    });
  }
  return chatId;
}

/**
 * Suscribe a la lista de chats del usuario y actualiza con datos en tiempo real.
 * @param {string} uid
 * @param {(rows: Array<Record<string, any>>) => void} onData
 * @param {(error: any) => void} [onError]
 * @returns {() => void}
 */
export function subscribeChats(uid, onData, onError) {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'chats'),
    where('participantIds', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(rows);
    },
    (err) => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[subscribeChats]', err?.code, err?.message);
      }
      onError?.(err);
      onData([]);
    }
  );
}

/**
 * Suscribe a los mensajes de un chat y publica cambios en tiempo real.
 * @param {string} chatId
 * @param {(rows: Array<Record<string, any>>) => void} onData
 * @param {(error: any) => void} [onError]
 * @returns {() => void}
 */
export function subscribeMessages(chatId, onData, onError) {
  const db = getFirestoreDb();
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(rows);
    },
    (err) => {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[subscribeMessages]', err?.code, err?.message);
      }
      onError?.(err);
      onData([]);
    }
  );
}

/**
 * Suscribe a la metadata de un chat (como lectura y hora de último mensaje).
 * @param {string} chatId
 * @param {(chat: Record<string, any>|null) => void} onData
 * @returns {() => void}
 */
export function subscribeChatMeta(chatId, onData) {
  const db = getFirestoreDb();
  const ref = doc(db, 'chats', chatId);
  return onSnapshot(ref, (snap) => {
    onData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

/**
 * Envía un mensaje de texto en un chat y actualiza el último mensaje.
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function sendTextMessage(chatId, senderId, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, 'chats', chatId, 'messages'));
  batch.set(msgRef, {
    text: trimmed,
    senderId,
    createdAt: serverTimestamp(),
  });
  const chatRef = doc(db, 'chats', chatId);
  batch.update(chatRef, {
    lastMessageText: trimmed.slice(0, 500),
    lastMessageAt: serverTimestamp(),
  });
  await batch.commit();

  // Enviar notificaciones push a los otros participantes
  try {
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      const participants = chatData.participantIds || [];
      const otherParticipants = participants.filter(id => id !== senderId);

      // Obtener el nombre del remitente
      const senderSnap = await getDoc(doc(db, 'users', senderId));
      const senderName = senderSnap.exists() ? senderSnap.data().displayName || 'Usuario' : 'Usuario';

      // Enviar notificación a cada participante
      for (const participantId of otherParticipants) {
        const token = await getUserFCMToken(participantId);
        if (token) {
          await sendNotification(token, `Nuevo mensaje de ${senderName}`, trimmed.slice(0, 100));
        }
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

/**
 * Marca que un usuario ha leído un chat.
 * @param {string} chatId
 * @param {string} readerUid
 * @returns {Promise<void>}
 */
export async function markChatRead(chatId, readerUid) {
  const db = getFirestoreDb();
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    [`lastReadAt.${readerUid}`]: serverTimestamp(),
  });
}

/**
 * Envía un mensaje de imagen en un chat.
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} imageUri
 * @returns {Promise<void>}
 */
export async function sendImageMessage(chatId, senderId, imageUri) {
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, 'chats', chatId, 'messages'));

  // Subir imagen a Storage
  const imageUrl = await uploadImage(imageUri);

  batch.set(msgRef, {
    type: 'image',
    imageUrl,
    senderId,
    createdAt: serverTimestamp(),
  });
  const chatRef = doc(db, 'chats', chatId);
  batch.update(chatRef, {
    lastMessageText: 'Imagen',
    lastMessageAt: serverTimestamp(),
  });
  await batch.commit();

  // Enviar notificaciones (similar a sendTextMessage)
  try {
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      const participants = chatData.participantIds || [];
      const otherParticipants = participants.filter(id => id !== senderId);

      const senderSnap = await getDoc(doc(db, 'users', senderId));
      const senderName = senderSnap.exists() ? senderSnap.data().displayName || 'Usuario' : 'Usuario';

      for (const participantId of otherParticipants) {
        const token = await getUserFCMToken(participantId);
        if (token) {
          await sendNotification(token, `Nuevo mensaje de ${senderName}`, 'Imagen');
        }
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

/**
 * Envía un mensaje de voz en un chat.
 * @param {string} chatId
 * @param {string} senderId
 * @param {string} audioUri
 * @param {number} duration - Duración en segundos.
 * @returns {Promise<void>}
 */
export async function sendVoiceMessage(chatId, senderId, audioUri, duration) {
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const msgRef = doc(collection(db, 'chats', chatId, 'messages'));

  // Subir audio a Storage
  const audioUrl = await uploadAudio(audioUri);

  batch.set(msgRef, {
    type: 'voice',
    audioUrl,
    duration,
    senderId,
    createdAt: serverTimestamp(),
  });
  const chatRef = doc(db, 'chats', chatId);
  batch.update(chatRef, {
    lastMessageText: 'Mensaje de voz',
    lastMessageAt: serverTimestamp(),
  });
  await batch.commit();

  // Enviar notificaciones
  try {
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chatData = chatSnap.data();
      const participants = chatData.participantIds || [];
      const otherParticipants = participants.filter(id => id !== senderId);

      const senderSnap = await getDoc(doc(db, 'users', senderId));
      const senderName = senderSnap.exists() ? senderSnap.data().displayName || 'Usuario' : 'Usuario';

      for (const participantId of otherParticipants) {
        const token = await getUserFCMToken(participantId);
        if (token) {
          await sendNotification(token, `Nuevo mensaje de ${senderName}`, 'Mensaje de voz');
        }
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}
