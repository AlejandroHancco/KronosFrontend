import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { KronosButton, KronosInput } from '../../components/kronos';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import apiClient from "../../api/client.ts";

interface StepEmailProps {
  onNext: (email: string, step: 'password' | 'google-only' | 'register') => void;
}

const StepEmail: React.FC<StepEmailProps> = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('1. handleContinue llamado con email:', email);
    
    if (!email || loading) {
      console.log('2. Email vacío o cargando, saliendo');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('3. Llamando a /auth/check-email...');
      const response = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      console.log('4. Respuesta del backend:', response.data);
      
      const { exists, provider } = response.data;
      console.log('5. exists:', exists, 'provider:', provider);

      if (!exists) {
        console.log('6. Usuario no existe → ir a registro');
        onNext(email, 'register');
      } else if (provider === 'google') {
        console.log('6. Usuario de Google → ir a google-only');
        onNext(email, 'google-only');
      } else {
        console.log('6. Usuario con password → ir a password');
        onNext(email, 'password');
      }
    } catch (error: any) {
      console.log('ERROR:', error?.response?.status, error?.message);
      console.log('ERROR data:', error?.response?.data);
      setError(error?.response?.data?.message || 'Error al verificar el correo. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <GoogleSignInButton />
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">o continúa con email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Correo electrónico
          </label>
          <KronosInput
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            leftIcon={<Mail className="text-muted-foreground" size={16} />}
            required
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md">
            {error}
          </div>
        )}

        <KronosButton
          type="button"
          className="w-full h-11"
          disabled={loading || !email}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            'Continuar'
          )}
        </KronosButton>
      </form>
    </div>
  );
};

export default StepEmail;
