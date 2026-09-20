import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { initializeLocalDatabase } from '../lib/db';

export interface UserSession {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'mph_local_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabase();
      if (supabase) {
        setIsSupabaseConnected(true);
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const u = data.session.user;
            setUser({
              id: u.id,
              email: u.email || '',
              name: u.user_metadata?.name || u.email?.split('@')[0] || 'Researcher',
            });
            initializeLocalDatabase(u.id);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed', err);
        }
      }

      // Check local session
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          initializeLocalDatabase(parsed.id);
        } catch (e) {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      } else {
        // Create default local researcher session for zero-friction out-of-the-box experience
        const defaultUser: UserSession = {
          id: 'user_researcher_local_01',
          email: 'researcher@manpower-nepal.local',
          name: 'Field Researcher'
        };
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
        setUser(defaultUser);
        initializeLocalDatabase(defaultUser.id);
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    const supabase = getSupabase();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0]
        };
        setUser(u);
        initializeLocalDatabase(u.id);
        return { success: true };
      }
    }

    // Local mode login
    const localUser: UserSession = {
      id: 'usr_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
      email,
      name: email.split('@')[0]
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
    setUser(localUser);
    initializeLocalDatabase(localUser.id);
    return { success: true };
  };

  const signup = async (email: string, password?: string, name?: string) => {
    const supabase = getSupabase();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split('@')[0] } }
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        const u = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || email.split('@')[0]
        };
        setUser(u);
        initializeLocalDatabase(u.id);
        return { success: true };
      }
    }

    return login(email);
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConnected,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
