import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithDemoUser: () => void;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Default demo authenticated user in development
    const saved = localStorage.getItem('kotiscout_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      id: 'user-demo-01',
      email: 'demo@kotiscout.fi',
      fullName: 'Demo Scout'
    };
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('kotiscout_auth_token') || 'demo-token-123';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // Subscribe to live Supabase Auth session updates
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name
        };
        setUser(authUser);
        setAccessToken(session.access_token);
        localStorage.setItem('kotiscout_auth_user', JSON.stringify(authUser));
        localStorage.setItem('kotiscout_auth_token', session.access_token);
      } else {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('kotiscout_auth_user');
        localStorage.removeItem('kotiscout_auth_token');
        queryClient.clear(); // Flush cache on logout
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const signInWithPassword = async (email: string, password: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name
          };
          setUser(authUser);
          setAccessToken(data.session.access_token);
          queryClient.clear(); // Reset queries for fresh user data
        }
        return {};
      }

      // Demo/Local simulated auth
      const simulated: AuthUser = {
        id: `user-${email.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'demo'}`,
        email,
        fullName: email.split('@')[0]
      };
      setUser(simulated);
      setAccessToken(`demo-token-${simulated.id}`);
      localStorage.setItem('kotiscout_auth_user', JSON.stringify(simulated));
      localStorage.setItem('kotiscout_auth_token', `demo-token-${simulated.id}`);
      queryClient.clear();
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signInWithDemoUser = () => {
    const demo: AuthUser = {
      id: 'user-demo-01',
      email: 'demo@kotiscout.fi',
      fullName: 'Demo Scout'
    };
    setUser(demo);
    setAccessToken('demo-token-123');
    localStorage.setItem('kotiscout_auth_user', JSON.stringify(demo));
    localStorage.setItem('kotiscout_auth_token', 'demo-token-123');
    queryClient.clear();
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ error?: string }> => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) return { error: error.message };
        return {};
      }

      // Demo sign up simulation
      const simulated: AuthUser = {
        id: `user-${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0]
      };
      setUser(simulated);
      setAccessToken(`demo-token-${simulated.id}`);
      localStorage.setItem('kotiscout_auth_user', JSON.stringify(simulated));
      localStorage.setItem('kotiscout_auth_token', `demo-token-${simulated.id}`);
      queryClient.clear();
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      return { error: msg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('kotiscout_auth_user');
    localStorage.removeItem('kotiscout_auth_token');
    queryClient.clear(); // Clear all cached user queries
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isDemoMode: !isSupabaseConfigured,
        signInWithPassword,
        signInWithDemoUser,
        signUp,
        signOut
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
