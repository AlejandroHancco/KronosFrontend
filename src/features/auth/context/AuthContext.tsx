import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { supabase } from '../../../lib/supabase';
import type { User, AuthContextType } from '../types';
import { getErrorMessage, type ApiErrorResponse } from '../../../types/api';
import apiClient from '../../../api/client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let isLoggingOut = false;

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      console.log('[Auth] validateSession() on mount');
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('[Auth] No token found in localStorage');
        // Intentamos ver si hay una sesión de Supabase antes de rendirnos
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[Auth] Supabase session found on mount');
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            lastName: session.user.user_metadata?.lastName || '',
            role: session.user.app_metadata?.role,
            provider: 'supabase',
          });
        }
        setLoading(false);
        return;
      }

      console.log('[Auth] Token found, calling GET /auth/me');
      try {
        const response = await apiClient.get('/auth/me');
        console.log('[Auth] GET /auth/me success:', response.data);
        setUser(response.data);
      } catch (err) {
        console.log('[Auth] GET /auth/me failed:', err);
        // Si falla /auth/me, podría ser porque es un usuario de Supabase y el backend no lo conoce
        // Verificamos si hay sesión de Supabase activa
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[Auth] Supabase session found after /auth/me failure');
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            lastName: session.user.user_metadata?.lastName || '',
            role: session.user.app_metadata?.role,
            provider: 'supabase',
          });
        } else {
          console.log('[Auth] Removing invalid token from localStorage');
          localStorage.removeItem('token');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    validateSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange event:', event, isLoggingOut);

      if (isLoggingOut) {
        setLoading(false);
        return;
      }

      const localToken = localStorage.getItem('token');
      if (localToken && !session && event !== 'SIGNED_OUT') {
        console.log('[Auth] Ignorando evento Supabase, hay JWT propio');
        setLoading(false);
        return;
      }

      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('[Auth] Supabase SIGNED_IN event, using session data');
          // No llamamos al backend aquí, usamos directamente los datos de Supabase
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: (session.user.user_metadata?.name as string) || (session.user.email?.split('@')[0] as string) || 'User',
            lastName: (session.user.user_metadata?.lastName as string) || '',
            role: session.user.app_metadata?.role as string | undefined,
            provider: 'supabase',
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] Supabase SIGNED_OUT event');
          if (!localToken) {
            setUser(null);
          }
        } else if (event === 'INITIAL_SESSION' && !session && !localToken) {
          console.log('[Auth] INITIAL_SESSION and no local token');
        }
      } catch (err) {
        console.error('[Auth] Error in onAuthStateChange handler:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[Auth] login() called with:', email);
    setLoading(true);
    setError(null);
    try {
      // Step 1: Login and get token
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      console.log('[Auth] login response received');
      console.log('[Auth] Saving access_token to localStorage');
      localStorage.setItem('token', access_token);

      // Step 2: Fetch user data from /auth/me
      console.log('[Auth] Calling GET /auth/me to fetch user data');
      const userResponse = await apiClient.get('/auth/me');
      console.log('[Auth] GET /auth/me success:', userResponse.data);
      
      const userData = userResponse.data;
      setUser({
        id: userData.uuid || userData.id,
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        role: userData.role,
        provider: 'jwt',
      });
      setLoading(false);
      
      console.log('[Auth] login() returning true');
      return true;
    } catch (err) {
      console.log('[Auth] login error:', err);
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.log("Datos del error desde el server:", axiosError.response?.data);
      setError(getErrorMessage(axiosError.response?.data) || 'Error en login');
      return false;
    }
    finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('[Auth] signInWithGoogle() called');
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      console.log('[Auth] signInWithOAuth result:', data, error);
      if (error) throw error;
    } catch (err: any) {
      console.error('[Auth] Error signing in with Google:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, name: string, lastName: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Register and get token
      const response = await apiClient.post('/auth/register', { email, name, lastName, password });
      const { access_token } = response.data;
      console.log('[Auth] register response received');
      console.log('[Auth] Saving access_token to localStorage');
      localStorage.setItem('token', access_token);

      // Step 2: Fetch user data from /auth/me
      console.log('[Auth] Calling GET /auth/me to fetch user data');
      const userResponse = await apiClient.get('/auth/me');
      console.log('[Auth] GET /auth/me success:', userResponse.data);
      
      const userData = userResponse.data;
      setUser({
        id: userData.uuid || userData.id,
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        role: userData.role,
        provider: 'jwt',
      });
      setLoading(false);
      
      return true;
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      setError(getErrorMessage(axiosError.response?.data) || 'Error en registro');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('[Auth] logout() called');
    isLoggingOut = true;
    setLoading(true);
    try {
      if (user?.provider === 'supabase') {
        console.log('[Auth] Provider is supabase, signing out from Supabase');
        await supabase.auth.signOut();
      }

      localStorage.removeItem('token');
      sessionStorage.clear();
      console.log('[Auth] Local storage and session storage cleared');
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
    } finally {
      setUser(null);
      setError(null);
      isLoggingOut = false;
      setLoading(false);
      console.log('[Auth] State cleared, redirecting to /login');
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    signInWithGoogle,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
