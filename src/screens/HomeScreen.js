import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { useAuthStore } from '../stores/useAuthStore';
import { useChatsList } from '../hooks/useChatsList';
import { ensureUserProfile } from '../services/chatService';
import { ROUTES } from '../constants/routes';

/**
 * Devuelve el título de chat para mostrar en la lista de conversaciones.
 * @param {{participantIds?: string[], memberTitles?: Record<string, string>}} chat
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
 * Pantalla principal que muestra la lista de conversaciones del usuario.
 */
export default function HomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid;
  const { data: chats = [] } = useChatsList(uid);

  useEffect(() => {
    if (user) {
      ensureUserProfile(user).catch(() => {});
    }
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate(ROUTES.NEW_CHAT)}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>Nuevo</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const openChat = useCallback(
    (chat) => {
      const other = chat.participantIds?.find((id) => id !== uid);
      navigation.getParent()?.navigate(ROUTES.CHAT, {
        chatId: chat.id,
        title: chatTitle(chat, uid),
        otherUserId: other,
      });
    },
    [navigation, uid]
  );

  const sorted = useMemo(() => chats, [chats]);

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
            <View style={styles.rowTop}>
              <Text style={styles.title}>{chatTitle(item, uid)}</Text>
              <Text style={styles.time}>{formatPreview(item.lastMessageAt)}</Text>
            </View>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastMessageText || 'Sin mensajes aún'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No hay conversaciones</Text>
            <Text style={styles.emptySub}>
              Pulsa <Text style={styles.bold}>Nuevo</Text> y busca el correo de otra persona registrada
              para chatear.
            </Text>
          </View>
        }
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  preview: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyWrap: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  headerBtn: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
