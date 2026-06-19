import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface UserStatus {
  emailVerified?: boolean;
  email?: string;
  teamStatus?: string;
}

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const pollEmailStatus = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        const userStatus: UserStatus = response.data;

        if (userStatus.emailVerified) {
          navigate('/join-team');
        }
      } catch (err) {
        console.error('Error fetching user status:', err);
      }
    };

    const interval = setInterval(pollEmailStatus, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });

      if (error) {
        console.error('Error resending email:', error);
      } else {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (err) {
      console.error('Error resending email:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <Breadcrumb items={[{ label: 'Onboarding' }, { label: 'Verificar correo' }]} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Verifica tu correo electrónico</h1>
      </div>

      <div className="border p-6 rounded bg-slate-800 max-w-md">
        <div className="flex items-start space-x-4 mb-6">
          <svg className="w-12 h-12 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <div>
            <p className="font-medium">Te enviamos un link a <span className="text-blue-400">{user?.email}</span></p>
            <p className="text-sm text-slate-300 mt-2">Revisa tu bandeja de entrada y haz click en el enlace.</p>
          </div>
        </div>

        {emailSent && (
          <div className="bg-green-900 text-green-200 p-3 rounded mb-4 text-sm">
            Correo reenviado exitosamente
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {resendLoading ? 'Reenviando...' : 'Reenviar correo'}
          </button>
          <button
            onClick={() => logout()}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;



