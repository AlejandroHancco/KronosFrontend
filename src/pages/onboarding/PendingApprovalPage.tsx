import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb';
import { useGetMyTeamStatus } from '../../hooks/useTeams';
import { useAuth } from '../../hooks/useAuth';

const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data, isLoading } = useGetMyTeamStatus();

  useEffect(() => {
    if (!data) return;
    if (data.status === 'APPROVED') {
      navigate('/');
    } else if (data.status === 'REJECTED') {
      navigate('/rejected');
    }
  }, [data, navigate]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <Breadcrumb items={[{ label: 'Onboarding' }, { label: 'En revisión' }]} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tu solicitud está siendo revisada</h1>
      </div>

      <div className="border p-6 rounded bg-slate-800 max-w-md">
        <div className="flex items-center space-x-4">
          <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a10 10 0 100 20 10 10 0 000-20z"></path></svg>
          <div>
            <p className="font-medium">El administrador del equipo revisará tu solicitud.</p>
            <p className="text-sm text-slate-300">Te notificaremos cuando sea aprobada.</p>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={() => logout()} className="bg-blue-500 text-white px-4 py-2 rounded">Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;

