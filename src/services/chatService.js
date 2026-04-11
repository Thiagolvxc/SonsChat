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

export function getDirectChatId(uidA, uidB) {
  return [uidA, uidB].sort().join('__');
}

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

export function subscribeChatMeta(chatId, onData) {
  const db = getFirestoreDb();
  const ref = doc(db, 'chats', chatId);
  return onSnapshot(ref, (snap) => {
    onData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

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
}

export async function markChatRead(chatId, readerUid) {
  const db = getFirestoreDb();
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    [`lastReadAt.${readerUid}`]: serverTimestamp(),
  });
}
