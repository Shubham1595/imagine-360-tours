import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken, getAuthToken } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SALES' | 'STAFF' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: { name: string; email: string; phone?: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  getRedirectPathForRole: (role: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setUser(response.data);
          setToken(storedToken);
        } else {
          setAuthToken(null);
          setUser(null);
          setToken(null);
        }
      } catch {
        setAuthToken(null);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getRedirectPathForRole = (role: string): string => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return '/admin';
      case 'SALES':
        return '/admin/crm';
      case 'STAFF':
        return '/admin/projects';
      case 'USER':
      default:
        return '/dashboard';
    }
  };

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const loggedUser = res.data.user;
        const authToken = res.data.token;
        setAuthToken(authToken);
        setUser(loggedUser);
        setToken(authToken);
        return loggedUser;
      }
      throw new Error(res.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { name: string; email: string; phone?: string; password: string }): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        const newUser = res.data.user;
        const authToken = res.data.token;
        setAuthToken(authToken);
        setUser(newUser);
        setToken(authToken);
        return newUser;
      }
      throw new Error(res.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
    authApi.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        getRedirectPathForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
