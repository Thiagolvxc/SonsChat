import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { signOutUser } from '../services/authService';
import { subscribeChats, deleteChat } from '../services/chatService';
import { useAuthStore } from '../stores/useAuthStore';
import { ROUTES } from '../constants/routes';

export default function HomeScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeChats(
      user.uid,
      (rows) => {
        setChats(rows);
        setLoading(false);
      },
      () => {
        setChats([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  async function handleLogout() {
    const result = await signOutUser();
    if (!result.ok) {
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
    }
  }

  async function handleDeleteChat(chatId) {
    try {
      await deleteChat(chatId);
    } catch (error) {
      console.warn('Error al eliminar chat:', error);
      Alert.alert('Error', 'No se pudo eliminar el chat. Intenta de nuevo.');
    }
  }

  function openChat(chat) {
    const title = chat.memberTitles?.[user.uid]
      ? Object.values(chat.memberTitles).find((name) => name !== chat.memberTitles[user.uid]) || 'Chat'
      : 'Chat';

    navigation.navigate(ROUTES.CHAT, {
      chatId: chat.id,
      title,
      otherUserId: chat.participantIds?.find((id) => id !== user.uid) || null,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.subtitle}>Bienvenido, {user?.displayName || user?.email || 'Usuario'}</Text>

      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => navigation.navigate(ROUTES.NEW_CHAT)}
      >
        <Text style={styles.newChatText}>+ Nuevo chat</Text>
      </TouchableOpacity>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.chatList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando chats...' : 'Aún no tienes chats. Crea uno nuevo.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const otherName = item.memberTitles?.[user.uid]
            ? Object.values(item.memberTitles).find((name) => name !== item.memberTitles[user.uid]) || 'Contacto'
            : 'Contacto';

          return (
            <View style={styles.chatRow}>
              <TouchableOpacity style={styles.chatInfo} onPress={() => openChat(item)}>
                <Text style={styles.chatTitle}>{otherName}</Text>
                <Text style={styles.chatSubtitle}>{item.lastMessageText || 'Empieza la conversación'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteChat(item.id)}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  newChatButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  newChatText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  chatList: {
    flex: 1,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  chatSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.error,
  },
  deleteText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});
