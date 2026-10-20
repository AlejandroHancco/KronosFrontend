import React, { useState } from 'react';
import { User, Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { KronosButton, KronosInput } from '../../components/kronos';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { consumePostLoginRedirect } from '../../lib/post-login-redirect';

interface StepRegisterProps {
  email: string;
  onBack: () => void;
}

const StepRegister: React.FC<StepRegisterProps> = ({ email, onBack }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    setValidationError(null);

    if (password.length < 8) {
      setValidationError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    const success = await register(email, name, lastName, password);
    if (success) {
      navigate(consumePostLoginRedirect());
    }
  };

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Crea tu cuenta</h3>
        <p className="text-sm text-muted-foreground break-all">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</label>
            <KronosInput
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan"
              disabled={loading}
              leftIcon={<User className="text-muted-foreground" size={16} />}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apellido</label>
            <KronosInput
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Perez"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
          <KronosInput
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            leftIcon={<Lock className="text-muted-foreground" size={16} />}
          />
          {password && (
             <div className="flex items-center gap-1.5 mt-1">
                <div className={`h-1 flex-1 rounded-full ${isPasswordValid ? 'bg-green-500' : 'bg-muted'}`} />
                <span className={`text-[10px] ${isPasswordValid ? 'text-green-500' : 'text-muted-foreground'}`}>
                  Mínimo 8 caracteres
                </span>
             </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirmar contraseña</label>
          <KronosInput
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            leftIcon={<Lock className="text-muted-foreground" size={16} />}
          />
          {confirmPassword && (
             <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={12} className={doPasswordsMatch ? 'text-green-500' : 'text-muted'} />
                <span className={`text-[10px] ${doPasswordsMatch ? 'text-green-500' : 'text-muted-foreground'}`}>
                  Las contraseñas coinciden
                </span>
             </div>
          )}
        </div>

        {(validationError || authError) && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md">
            {validationError || authError}
          </div>
        )}

        <KronosButton
          type="button"
          className="w-full h-11"
          disabled={loading || !isPasswordValid || !doPasswordsMatch || !name || !lastName}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </KronosButton>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors pt-2"
        >
          <ArrowLeft size={14} />
          Volver
        </button>
      </form>
    </div>
  );
};

export default StepRegister;
