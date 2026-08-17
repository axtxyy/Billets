import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'billets_access_token',
  REFRESH_TOKEN: 'billets_refresh_token',
  USER: 'billets_user',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = () => {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);

      if (accessToken && refreshToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          setState({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch {
          clearAuth();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const setAuth = (data: { access_token: string; refresh_token: string; user: User }) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    setState({
      user: data.user,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login(email, password);
      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;
        
        // Fetch user profile
        const userResponse = await authApi.getMe(access_token);
        if (userResponse.success && userResponse.data) {
          setAuth({
            access_token,
            refresh_token,
            user: userResponse.data,
          });
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; full_name: string; phone?: string }) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;
        
        // Fetch user profile
        const userResponse = await authApi.getMe(access_token);
        if (userResponse.success && userResponse.data) {
          setAuth({
            access_token,
            refresh_token,
            user: userResponse.data,
          });
        } else {
          throw new Error('Failed to fetch user profile');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const refreshAuth = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      clearAuth();
      return;
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      if (response.success && response.data) {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        const user = userStr ? JSON.parse(userStr) : state.user;
        setAuth({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: user!,
        });
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    }
  };

  const updateUser = (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}