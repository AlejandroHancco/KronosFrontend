import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { KronosButton, KronosInput } from '../kronos';
import { AlertCircle, ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

const EmailOtpForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { sendOtp, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    const { error: sendError } = await sendOtp(email);
    if (sendError) {
      setError(sendError.message || 'Error al enviar el código. Inténtalo de nuevo.');
    } else {
      setStep(2);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    const { error: verifyError } = await verifyOtp(email, otp);
    if (verifyError) {
      setError(verifyError.message || 'Código inválido o expirado.');
    } else {
      navigate('/dashboard');
    }
  };

  const goBack = () => {
    setStep(1);
    setError(null);
    setOtp('');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-md flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <KronosInput
            label="Correo electrónico"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<Mail className="text-muted-foreground" size={16} />}
            required
          />
          <KronosButton
            type="submit"
            className="w-full h-11"
            disabled={loading || !email}
          >
            {loading ? 'Enviando...' : 'Enviar código'}
          </KronosButton>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="text-center mb-2">
            <p className="text-sm text-muted-foreground">
              Hemos enviado un código a <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          <KronosInput
            label="Código de verificación"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            disabled={loading}
            icon={<ShieldCheck className="text-muted-foreground" size={16} />}
            required
          />
          <div className="flex gap-2">
            <KronosButton
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={goBack}
              disabled={loading}
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver
            </KronosButton>
            <KronosButton
              type="submit"
              className="flex-[2] h-11"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </KronosButton>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailOtpForm;
