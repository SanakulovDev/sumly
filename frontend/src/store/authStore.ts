import { create } from 'zustand';
import type { User } from '../types';
import { authApi } from '../api/auth';
import { tokenStorage } from '../api/client';

interface AuthState {
  user: User | null;
  // True until the initial "am I logged in?" check completes, so the app can
  // avoid flashing the login page for already-authenticated users on reload.
  initializing: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  // Restores the session from a stored token on app start.
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,

  login: async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    tokenStorage.set(token);
    set({ user });
  },

  register: async (name, email, password) => {
    const { token, user } = await authApi.register(name, email, password);
    tokenStorage.set(token);
    set({ user });
  },

  logout: () => {
    tokenStorage.clear();
    set({ user: null });
  },

  bootstrap: async () => {
    const token = tokenStorage.get();
    if (!token) {
      set({ initializing: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, initializing: false });
    } catch {
      // Token invalid/expired — drop it and continue as a guest.
      tokenStorage.clear();
      set({ user: null, initializing: false });
    }
  },
}));
