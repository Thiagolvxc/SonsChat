import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import Button from '../components/Button';
import { signOutUser } from '../services/authService';
import { resetToLogin } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/useAuthStore';

/**
 * Pantalla de perfil donde el usuario puede ver su correo y cerrar sesión.
 */
export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const result = await signOutUser();
    setLoading(false);
    if (!result.ok) {
      Alert.alert('Cerrar sesión', result.error);
      return;
    }
    resetToLogin();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu perfil</Text>
      {user?.displayName ? (
        <>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.value}>{user.displayName}</Text>
        </>
      ) : null}
      <Text style={[styles.label, user?.displayName && styles.labelSpaced]}>Correo</Text>
      <Text style={styles.value}>{user?.email ?? '—'}</Text>
      <View style={styles.actions}>
        <Button
          title="Cerrar sesión"
          onPress={handleSignOut}
          variant="secondary"
          disabled={loading}
        />
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  labelSpaced: {
    marginTop: 16,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  actions: {
    marginTop: 32,
  },
});
