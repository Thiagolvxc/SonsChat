import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/useAuthStore';
import { getFirebaseAuth, isFirebaseConfigured } from './src/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const setStoreUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStoreUser(null);
      setIsReady(true);
      return undefined;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setStoreUser(currentUser);
      setIsReady(true);
    });

    return unsubscribe;
  }, [setStoreUser]);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator user={user} />
    </NavigationContainer>
  );
}
