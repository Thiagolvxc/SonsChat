import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { useAuthStore } from '../stores/useAuthStore';
import { ROUTES } from '../constants/routes';

const MIN_SPLASH_MS = 1200;

export default function SplashScreen({ navigation }) {
  const authReady = useAuthStore((s) => s.authReady);
  const user = useAuthStore((s) => s.user);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!minElapsed || !authReady) return;
    navigation.replace(user ? ROUTES.MAIN : ROUTES.LOGIN);
  }, [minElapsed, authReady, user, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SonsChat</Text>
      <Text style={styles.subtitle}>Mensajería</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
