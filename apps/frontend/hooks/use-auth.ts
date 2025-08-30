'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'FARMER' | 'BUYER' | 'ADMIN';
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // TODO: Validate token with backend
          // For now, just simulate a user
          setUser({
            id: '1',
            email: 'demo@example.com',
            phone: '+919876543210',
            name: 'Demo User',
            role: 'FARMER',
            kycStatus: 'VERIFIED',
            profileComplete: true,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual login API call
      const mockUser: User = {
        id: '1',
        email,
        phone: '+919876543210',
        name: 'Demo User',
        role: 'FARMER',
        kycStatus: 'VERIFIED',
        profileComplete: true,
      };
      
      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
