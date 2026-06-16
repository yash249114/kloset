import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kloset_access_token', accessToken);
          localStorage.setItem('kloset_refresh_token', refreshToken);
          localStorage.setItem('kloset_user', JSON.stringify(user));
          document.cookie = 'kloset-auth=true; path=/; max-age=604800; SameSite=Lax; Secure';
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setUser: (user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('kloset_user', JSON.stringify(user));
        }
        set({ user });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kloset_access_token');
          localStorage.removeItem('kloset_refresh_token');
          localStorage.removeItem('kloset_user');
          document.cookie = 'kloset-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      initializeAuth: async () => {
        const state = get();
        if (state.isInitialized) return;

        const token = typeof window !== 'undefined'
          ? localStorage.getItem('kloset_access_token')
          : null;

        if (!token) {
          set({ isLoading: false, isInitialized: true });
          return;
        }

        try {
          const { authAPI } = await import('@/lib/api');
          const user = await authAPI.me();
          if (typeof window !== 'undefined') {
            document.cookie = 'kloset-auth=true; path=/; max-age=604800; SameSite=Lax; Secure';
          }
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          // Token expired or invalid — clean up
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kloset_access_token');
            localStorage.removeItem('kloset_refresh_token');
            localStorage.removeItem('kloset_user');
            document.cookie = 'kloset-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          }
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: 'kloset-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true;
          state.isLoading = false;
        }
      },
    }
  )
);
