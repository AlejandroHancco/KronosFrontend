import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KronosLayout, KronosCard } from '../components/kronos';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        console.error('Error during auth callback:', error?.message || 'No session found');
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <KronosLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <KronosCard className="p-8 text-center max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Procesando inicio de sesión</h2>
          <p className="text-muted-foreground text-sm">Por favor espera un momento mientras validamos tu cuenta.</p>
        </KronosCard>
      </div>
    </KronosLayout>
  );
};

export default AuthCallback;
