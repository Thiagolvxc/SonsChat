import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { useAuthStore } from '../stores/useAuthStore';
import { useMessagesList } from '../hooks/useMessagesList';
import {
  markChatRead,
  sendTextMessage,
  subscribeChatMeta,
} from '../services/chatService';

function formatTime(ts) {
  if (!ts?.seconds) return '';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({ route, navigation }) {
  const { chatId, title, otherUserId } = route.params || {};
  const user = useAuthStore((s) => s.user);
  const uid = user?.uid;
  const { data: messages = [] } = useMessagesList(chatId);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [chatMeta, setChatMeta] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: title || 'Chat' });
  }, [navigation, title]);

  useEffect(() => {
    if (!chatId) return undefined;
    return subscribeChatMeta(chatId, setChatMeta);
  }, [chatId]);

  useFocusEffect(
    useCallback(() => {
      if (chatId && uid) {
        markChatRead(chatId, uid).catch(() => {});
      }
    }, [chatId, uid])
  );

  const otherLastRead = useMemo(() => {
    if (!chatMeta?.lastReadAt || !otherUserId) return null;
    const v = chatMeta.lastReadAt[otherUserId];
    return v?.seconds != null ? v : null;
  }, [chatMeta, otherUserId]);

  const send = useCallback(async () => {
    if (!input.trim() || !uid || !chatId || sending) return;
    setSending(true);
    try {
      await sendTextMessage(chatId, uid, input);
      setInput('');
    } finally {
      setSending(false);
    }
  }, [chatId, input, sending, uid]);

  const renderItem = useCallback(
    ({ item }) => {
      const isMine = item.senderId === uid;
      const created = item.createdAt;
      const readByOther =
        isMine &&
        otherLastRead &&
        created?.seconds != null &&
        otherLastRead.seconds >= created.seconds;

      return (
        <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.time}>{formatTime(created)}</Text>
              {isMine ? (
                <Text style={styles.ticks}>{readByOther ? '✓✓' : '✓'}</Text>
              ) : null}
            </View>
          </View>
        </View>
      );
    },
    [otherLastRead, uid]
  );

  if (!chatId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.err}>Chat no disponible.</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Mensaje"
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnOff]}
          onPress={send}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  err: {
    color: colors.error,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  ticks: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  sendBtnOff: {
    opacity: 0.45,
  },
  sendBtnText: {
    color: colors.text,
    fontWeight: '600',
  },
});
