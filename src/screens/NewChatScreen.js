import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { useAuthStore } from '../stores/useAuthStore';
import { getOrCreateDirectChat, searchUsersByEmailPrefix } from '../services/chatService';
import { ROUTES } from '../constants/routes';

export default function NewChatScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  async function buscar() {
    setError('');
    if (!user?.uid) return;
    const q = query.trim();
    if (q.length < 2) {
      setError('Escribe al menos 2 caracteres del correo.');
      return;
    }
    setLoading(true);
    try {
      const rows = await searchUsersByEmailPrefix(user.uid, q);
      setResults(rows);
      if (!rows.length) {
        setError('No se encontraron usuarios con ese correo.');
      }
    } catch (e) {
      setError('No se pudo buscar. ¿Activaste Firestore y las reglas?');
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[NewChat]', e?.code, e?.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function abrirChat(other) {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const chatId = await getOrCreateDirectChat(
        { uid: user.uid, displayName: user.displayName || user.email },
        { uid: other.uid, displayName: other.displayName || other.email }
      );
      const title =
        other.displayName?.trim() ||
        other.email ||
        `Usuario ${other.uid.slice(-4)}`;
      navigation.replace(ROUTES.CHAT, {
        chatId,
        title,
        otherUserId: other.uid,
      });
    } catch (e) {
      setError('No se pudo abrir el chat.');
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.warn('[NewChat] abrir', e?.code, e?.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.hint}>
          Busca por el correo de otro usuario registrado en SonsChat.
        </Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.btn} onPress={buscar} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.btnText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <FlatList
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => abrirChat(item)}>
              <Text style={styles.name}>{item.displayName || 'Sin nombre'}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && !error ? (
              <Text style={styles.empty}>Busca un correo para ver resultados.</Text>
            ) : null
          }
        />
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
  container: {
    flex: 1,
    padding: 16,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginRight: 8,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  btnText: {
    color: colors.text,
    fontWeight: '600',
  },
  error: {
    color: colors.error,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  empty: {
    color: colors.textSecondary,
    marginTop: 24,
    textAlign: 'center',
  },
});
