import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import Button from '../components/Button';
import AppTextField from '../components/AppTextField';
import { registerWithEmail } from '../services/authService';
import { ROUTES } from '../constants/routes';

/**
 * Pantalla de registro de nuevo usuario para crear una cuenta de SonsChat.
 */
export default function RegisterScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleRegister() {
    setFormError('');
    if (!email.trim() || !password) {
      setFormError('Completa correo y contraseña.');
      return;
    }
    if (password !== confirm) {
      setFormError('Las contraseñas no coinciden.');
      return;
    }
    setSubmitting(true);
    const result = await registerWithEmail(email, password, displayName);
    setSubmitting(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigation.replace(ROUTES.MAIN);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Nueva cuenta</Text>
          <Text style={styles.hint}>Crea tu usuario con correo y contraseña.</Text>

          <View style={styles.fields}>
            <AppTextField
              label="Nombre (opcional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
            <AppTextField
              label="Correo"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <AppTextField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textContentType="newPassword"
            />
            <AppTextField
              label="Confirmar contraseña"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              textContentType="newPassword"
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button title="Registrarme" onPress={handleRegister} disabled={submitting} />

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
          >
            <Text style={styles.link}>Ya tengo cuenta</Text>
          </TouchableOpacity>

          <StatusBar style="light" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  container: {
    width: '100%',
    alignItems: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  fields: {
    marginBottom: 8,
  },
  formError: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  linkWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  link: {
    color: colors.primary,
    fontSize: 15,
  },
});
