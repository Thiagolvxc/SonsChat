import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import { useAppStore } from '../stores/useAppStore';

export default function SplashScreen({ navigation }) {
  const setReady = useAppStore((state) => state.setReady);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation, setReady]);

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
