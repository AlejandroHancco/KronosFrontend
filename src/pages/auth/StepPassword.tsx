import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2, Key, Mail } from 'lucide-react';
import { KronosButton, KronosInput } from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface StepPasswordProps {
  email: string;
  onBack: () => void;
}

const StepPassword: React.FC<StepPasswordProps> = ({ email, onBack }) => {
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const { login, loading: authLoading, error: authError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!password || authLoading || localLoading) return;

    console.log('Intentando login para:', email);
    const success = await login(email, password);
    console.log('Resultado del login:', success);
    
    if (success) {
      console.log('Login exitoso, redirigiendo a /dashboard');
      navigate('/dashboard');
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
            disabled={authLoading || localLoading}
            icon={<Lock className="text-muted-foreground" size={16} />}
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
          disabled={authLoading || localLoading || !password}
          onClick={handleLogin}
        >
          {authLoading ? (
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
            disabled={authLoading || localLoading}
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
