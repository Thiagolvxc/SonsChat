import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/navigationRef';
import { useAuthStore } from './src/stores/useAuthStore';
import { getFirebaseAuth, isFirebaseConfigured } from './src/services/firebase';
import { queryClient } from './src/query/queryClient';
import { initializeNotifications, getFCMToken, saveFCMToken } from './src/services/notificationService';

/**
 * Componente que inicializa el estado de autenticación al arrancar la app.
 * @param {{children: import('react').ReactNode}} props
 */
function AuthBootstrap({ children }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setUser(null);
      setAuthReady(true);
      return undefined;
    }
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, (user) => {
        setUser(user);
        setAuthReady(true);
      });
    } catch {
      setUser(null);
      setAuthReady(true);
      return undefined;
    }
  }, [setUser, setAuthReady]);

  return children;
}
/**
 * Punto de entrada principal de la aplicación SonsChat.
 * Contiene el proveedor de estado, navigation y la inicialización de Firebase.
 */
export default function App() {
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isAuthReady && isFirebaseConfigured()) {
      initializeNotifications();
    }
  }, [isAuthReady]);

  useEffect(() => {
    if (user?.uid) {
      // Guardar el token FCM cuando el usuario está autenticado
      getFCMToken().then(token => {
        if (token) {
          saveFCMToken(user.uid, token);
        }
      });
    }
  }, [user]);

  /**
   * Punto de entrada principal de la aplicación SonsChat.
   * Contiene el proveedor de estado, navigation y la inicialización de Firebase.
   */
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <AuthBootstrap>
            <AppNavigator />
          </AuthBootstrap>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}