import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Livreur' | 'Admin' | 'Opérateur';
  matricule?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, role?: AuthUser['role']) => Promise<void>;
  signup: (name: string, email: string, role?: AuthUser['role']) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'eguette_auth_user';

const DEFAULT_USER: AuthUser = {
  id: 'usr-default',
  name: 'Chef Marc V.',
  email: 'manager@jengu.tech',
  role: 'Manager',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = async (email: string, name?: string, role: AuthUser['role'] = 'Manager') => {
    // Simulate short network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const authenticatedUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name || (email.split('@')[0] ? email.split('@')[0].replace('.', ' ') : 'Utilisateur'),
      email,
      role,
    };
    setUser(authenticatedUser);
  };

  const signup = async (name: string, email: string, role: AuthUser['role'] = 'Manager') => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: name.trim() || 'Nouveau Membre',
      email: email.trim(),
      role,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
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
