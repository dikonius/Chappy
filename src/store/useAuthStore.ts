// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: { id: string; name: string } | null;
  isGuest: boolean;
  setAuth: (token: string, user: { id: string; name: string }) => void;
  setGuest: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({  
      token: null,
      user: null,
      isGuest: true,
      setAuth: (token, user) => set({ token, user, isGuest: false }),
      setGuest: () => set({ token: null, user: null, isGuest: true }),
      logout: () => set({ token: null, user: null, isGuest: true }),
    }),
    {
      name: 'chappy-auth',  // localStorage key
      partialize: (state) => ({ token: state.token, user: state.user }),  // Only persist token/user
    }
  )
);