'use client';

import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';
import { api } from './api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        } catch {
          api.removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    api.setToken(token);
    setUser(userData);
  };

  const logout = () => {
    api.removeToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      logout();
    }
  };

  return createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      },
    },
    children
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
