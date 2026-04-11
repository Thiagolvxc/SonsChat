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

export default function App() {
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
