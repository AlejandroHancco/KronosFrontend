import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2, Key, Mail } from 'lucide-react';
import { KronosButton, KronosInput } from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { consumePostLoginRedirect } from '../../lib/post-login-redirect';

interface StepPasswordProps {
  email: string;
  onBack: () => void;
}

const StepPassword: React.FC<StepPasswordProps> = ({ email, onBack }) => {
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, error: authError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!password || localLoading) return;

    setLocalError(null);
    setLocalLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate(consumePostLoginRedirect());
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        setLocalError('Contraseña incorrecta. Inténtalo de nuevo.');
      } else {
        setLocalError('Error al iniciar sesión. Inténtalo más tarde.');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }
      });
      if (error) throw error;
      setOtpSent(true);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setLocalError(err.message || 'Error al enviar el link de acceso.');
    } finally {
      setLocalLoading(false);
    }
  };

  if (otpSent) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
          <Mail className="text-primary" size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Te enviamos un link</h3>
          <p className="text-sm text-muted-foreground">
            Revisa tu correo <span className="text-foreground font-medium">{email}</span> para iniciar sesión sin contraseña.
          </p>
        </div>
        <KronosButton variant="outline" onClick={onBack} className="w-full">
          Volver al inicio
        </KronosButton>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Bienvenido de vuelta</h3>
        <p className="text-sm text-muted-foreground break-all">{email}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Contraseña
          </label>
          <KronosInput
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={localLoading}
            leftIcon={<Lock className="text-muted-foreground" size={16} />}
            required
            autoFocus
          />
        </div>

        {(authError || localError) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md">
            {authError || localError}
          </div>
        )}

        <KronosButton
          type="button"
          className="w-full h-11"
          disabled={localLoading || !password}
          onClick={handleLogin}
        >
          {localLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </KronosButton>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={localLoading}
            className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
          >
            <Key size={14} />
            Entrar sin contraseña
          </button>

          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            Volver
          </button>
        </div>
      </form>
    </div>
  );
};

export default StepPassword;
