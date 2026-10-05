import { create } from 'zustand';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const AUTH_STORAGE_KEY = 'isot2026-admin-auth-token';
const USER_STORAGE_KEY = 'isot2026-admin-user-info';

export const useAuthStore = create<AuthState>((set, get) => {
  // Read initial cached state
  const cachedToken = localStorage.getItem(AUTH_STORAGE_KEY);
  const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

  let initialUser: AdminUser | null = null;
  if (cachedUser) {
    try {
      initialUser = JSON.parse(cachedUser);
    } catch {
      initialUser = null;
    }
  }

  return {
    token: cachedToken,
    user: initialUser,
    isAuthenticated: Boolean(cachedToken && initialUser),
    isLoading: false,
    error: null,

    login: async (username, password) => {
      set({ isLoading: true, error: null });
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          const errMsg = data.error || 'Authentication failed. Please check your credentials.';
          set({ isLoading: false, error: errMsg, isAuthenticated: false, token: null, user: null });
          return false;
        }

        // Store token and user
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } catch (err) {
        console.error('Login error:', err);
        set({
          isLoading: false,
          error: 'Unable to connect to authentication server. Please ensure the backend is running.',
        });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    },

    checkAuth: async () => {
      const token = get().token || localStorage.getItem(AUTH_STORAGE_KEY);
      if (!token) {
        set({ isAuthenticated: false, user: null, token: null });
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          }
        } else {
          // Token expired or invalid
          get().logout();
        }
      } catch {
        // If server is unreachable but we have cached token, keep state for offline tolerance
      }
    },

    clearError: () => set({ error: null }),
  };
});
