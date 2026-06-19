import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb';
import { useGetMyTeamStatus } from '../../hooks/useTeams';

const RejectedPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyTeamStatus();

  useEffect(() => {
    if (data?.rejectionCount !== undefined && data.rejectionCount >= 3) {
      navigate('/banned');
    }
  }, [data, navigate]);

  if (isLoading) return <LoadingSpinner />;

  const attemptsLeft = Math.max(0, 3 - (data?.rejectionCount || 0));

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <Breadcrumb items={[{ label: 'Onboarding' }, { label: 'Rechazado' }]} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tu solicitud fue rechazada</h1>
      </div>

      <div className="border p-6 rounded bg-slate-800 max-w-md">
        <p className="mb-4">Lamentablemente tu solicitud fue rechazada.</p>
        <p className="mb-4">Te quedan {attemptsLeft} intentos.</p>

        <div className="flex space-x-2">
          <button onClick={() => navigate('/join-team')} className="bg-blue-500 text-white px-4 py-2 rounded">Intentar con otro código</button>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;

