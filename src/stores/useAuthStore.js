import { create } from 'zustand';

/**
 * Store de Zustand que mantiene el usuario actual y el estado de carga auth.
 * @returns {{user: object|null, authReady: boolean, setUser: Function, setAuthReady: Function}}
 */
export const useAuthStore = create((set) => ({
  user: null,
  authReady: false,
  setUser: (user) => set({ user }),
  setAuthReady: (value) => set({ authReady: value }),
}));
