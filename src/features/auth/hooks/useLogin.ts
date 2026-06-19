import { useState } from 'react';

type AuthSession = {
  email: string;
  token?: string;
};

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciales incorrectas');
      }

      setSession({
        email,
        token: data.token,
      });

      return data;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setSession(null);
    setError(null);
  };

  return {
    login,
    logout,
    loading,
    error,
    session,
    isAuthenticated: session !== null,
  };
};
