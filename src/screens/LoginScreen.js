import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';
import Button from '../components/Button';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.placeholder}>
        Pantalla de login (Entregable 2)
      </Text>
      <View style={styles.buttonWrap}>
        <Button
          title="Continuar"
          onPress={() => navigation.replace('Main')}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  buttonWrap: {
    marginTop: 24,
  },
});
