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
import { signInWithEmail } from '../services/authService';
import { ROUTES } from '../constants/routes';

/**
 * Pantalla de inicio de sesión que permite a los usuarios entrar con correo y contraseña.
 */
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleLogin() {
    setFormError('');
    if (!email.trim() || !password) {
      setFormError('Completa correo y contraseña.');
      return;
    }
    setSubmitting(true);
    const result = await signInWithEmail(email, password);
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
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.hint}>Accede con tu correo y contraseña.</Text>

          <View style={styles.fields}>
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
              textContentType="password"
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button title="Entrar" onPress={handleLogin} disabled={submitting} />

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
          >
            <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  container: {
    width: '100%',
    alignItems: 'stretch',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 28,
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
