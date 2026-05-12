import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/routes';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import NewChatScreen from '../screens/NewChatScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createNativeStackNavigator();

/**
 * Navegación mínima para la aplicación simplificada.
 */
export default function AppNavigator({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
          <Stack.Screen
            name={ROUTES.NEW_CHAT}
            component={NewChatScreen}
            options={{ headerShown: true, title: 'Nuevo chat' }}
          />
          <Stack.Screen
            name={ROUTES.CHAT}
            component={ChatScreen}
            options={{ headerShown: true, title: 'Chat' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
          <Stack.Screen
            name={ROUTES.REGISTER}
            component={RegisterScreen}
            options={{ headerShown: true, title: 'Crear cuenta' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
