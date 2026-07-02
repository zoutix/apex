import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'apexfuel-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
