import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  authReady: false,
  setUser: (user) => set({ user }),
  setAuthReady: (value) => set({ authReady: value }),
}));
