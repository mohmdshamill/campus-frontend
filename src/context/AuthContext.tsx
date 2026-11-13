import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isCoordinator: boolean;
  isStudent: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('cc_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('cc_user', JSON.stringify(res.data));
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await authApi.login(credentials);
    const { user: loggedInUser, token: authToken } = res.data;

    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('cc_token', authToken);
    localStorage.setItem('cc_user', JSON.stringify(loggedInUser));

    return loggedInUser;
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    const { user: registeredUser, token: authToken } = res.data;

    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('cc_token', authToken);
    localStorage.setItem('cc_user', JSON.stringify(registeredUser));

    return registeredUser;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isCoordinator = user?.role === 'COORDINATOR';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isSuperAdmin,
        isCoordinator,
        isStudent,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
