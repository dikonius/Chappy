import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
}

interface AuthState {
  token: string | null;
  user: { id: string; name: string } | null;
  isGuest: boolean;
  setAuth: (token: string, user: { id: string; name: string }) => void;
  setGuest: () => void;
  logout: () => void;
}

interface ChatState {
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AuthState & ChatState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isGuest: true,
      setAuth: (token, user) => set({ token, user, isGuest: false }),
      setGuest: () => set({ token: null, user: null, isGuest: true }),
      logout: () => set({ token: null, user: null, isGuest: true }),
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'chappy-app' }
  )
);
