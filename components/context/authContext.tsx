'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<User | null>;
  register: (userData: Record<string, unknown>) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get<{
            user: User | undefined; data?: { user?: User } 
}>('/auth/me');
        const resolvedUser = data?.data?.user ?? data?.user ?? data?.data;
        setUser((resolvedUser as User | undefined) ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials: Record<string, unknown>) => {
    const { data } = await api.post<{
      user: User | undefined;
      accessToken?: string;
      data?: { user?: User; accessToken?: string };
    }>('/auth/login', credentials);

    const token = data?.data?.accessToken ?? (data as any)?.accessToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }

    const resolvedUser = data?.data?.user ?? data?.user ?? data?.data;
    const nextUser = (resolvedUser as User | undefined) ?? null;
    setUser(nextUser);
    return nextUser;
  };

  const register = async (userData: Record<string, unknown>) => {
    const { data } = await api.post<{
      user: User | undefined;
      accessToken?: string;
      data?: { user?: User; accessToken?: string };
    }>('/auth/register', userData);

    const token = data?.data?.accessToken ?? (data as any)?.accessToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }

    const resolvedUser = data?.data?.user ?? data?.user ?? data?.data;
    const nextUser = (resolvedUser as User | undefined) ?? null;
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API notification error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
      }
      setUser(null)
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {

    const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
