import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService, AuthResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    college: string;
    course: string;
    yearOfStudy: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (updated: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skillsync_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const currentUser = await authService.getMe();
      setUser(currentUser);
      localStorage.setItem('skillsync_user', JSON.stringify(currentUser));
    } catch (err) {
      console.error('Failed to load session user:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillsync_token');
      localStorage.removeItem('skillsync_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res: AuthResponse = await authService.login(credentials);
    localStorage.setItem('skillsync_token', res.token);
    localStorage.setItem('skillsync_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res: AuthResponse = await authService.register(data);
    localStorage.setItem('skillsync_token', res.token);
    localStorage.setItem('skillsync_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {}
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_user');
    setToken(null);
    setUser(null);
  };

  const updateCurrentUser = (updated: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      localStorage.setItem('skillsync_user', JSON.stringify(next));
      return next;
    });
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
