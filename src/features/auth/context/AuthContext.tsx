import type React from 'react';
import { createContext, useState, useEffect, useRef } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import type { User, AuthContextType } from '../types';
import { getErrorMessage, type ApiErrorResponse } from '../../../types/api';
import apiClient from '../../../api/client';
import { getJwtExpiry } from '../../../lib/jwt';

// Avisar cuando falten 5 min para que expire el JWT propio (Supabase ya se
// auto-refresca solo, esto es solo para la sesión local email+password).
const SESSION_WARNING_MS = 5 * 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 30 * 1000;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

let isLoggingOut = false;

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Evita re-mostrar el toast de aviso en cada tick del intervalo mientras
  // el usuario no haya extendido o cerrado sesión.
  const warnedForExpiryRef = useRef<number | null>(null);

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
        const meData = response.data;
        setUser({
          id: meData.uuid || meData.id,
          email: meData.email,
          name: meData.name,
          lastName: meData.lastName,
          role: meData.role,
          permissions: meData.permissions || [],
          roleNames: meData.roleNames || [],
          provider: 'jwt',
        });
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

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      warnedForExpiryRef.current = null;
      return true;
    } catch (err) {
      console.log('[Auth] refreshToken failed:', err);
      return false;
    }
  };

  // Avisa antes de que expire el JWT propio y ofrece extenderlo con un clic,
  // en vez de que el usuario se tope con el 401 "en frío".
  useEffect(() => {
    if (user?.provider !== 'jwt') return;

    const checkExpiry = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const expiresAt = getJwtExpiry(token);
      if (!expiresAt) return;

      const msLeft = expiresAt - Date.now();
      if (msLeft <= 0 || msLeft > SESSION_WARNING_MS) return;
      if (warnedForExpiryRef.current === expiresAt) return; // ya avisado para este token

      warnedForExpiryRef.current = expiresAt;
      toast('Tu sesión está por expirar', {
        description: 'Se cerrará en unos minutos si no la extiendes.',
        duration: Infinity,
        action: {
          label: 'Extender sesión',
          onClick: async () => {
            const ok = await refreshToken();
            toast[ok ? 'success' : 'error'](
              ok ? 'Sesión extendida' : 'No se pudo extender la sesión',
            );
          },
        },
      });
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, SESSION_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user?.provider]);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('[Auth] login() called with:', email);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      const userResponse = await apiClient.get('/auth/me');
      console.log('[Auth] GET /auth/me success:', userResponse.data);
      const userData = userResponse.data;
      setUser({
        id: userData.uuid || userData.id,
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        role: userData.role,
        permissions: userData.permissions || [],
        roleNames: userData.roleNames || [],
        provider: 'jwt',
      });
      return true;
    } catch (err) {
      console.log('[Auth] login error:', err);
      throw err;
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
        permissions: userData.permissions || [],
        roleNames: userData.roleNames || [],
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
    refreshToken,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
