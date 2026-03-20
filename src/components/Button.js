import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Button({ title, onPress, variant = 'primary' }) {
  const isSecondary = variant === 'secondary';
  return (
    <TouchableOpacity
      style={[styles.button, isSecondary && styles.buttonSecondary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, isSecondary && styles.textSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: colors.textSecondary,
  },
});
