import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb';
import { useJoinTeam, useGetMyTeamStatus } from '../../hooks/useTeams';

const JoinTeamPage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: statusData, isLoading: statusLoading, isError: statusError, error: statusErrorObj } = useGetMyTeamStatus();
  const { mutateAsync, isPending } = useJoinTeam();

  useEffect(() => {
    console.log('JoinTeamPage: Status Loading:', statusLoading);
    console.log('JoinTeamPage: Status Error:', statusError);
    console.log('JoinTeamPage: Status Data:', statusData);
  }, [statusLoading, statusError, statusData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLocalError(null);
    try {
      await mutateAsync(code);
      navigate('/pending-approval');
    } catch (err: unknown) {
      // Narrowing: comprobamos si es un error de Axios
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        if (status === 400) {
          setLocalError('Código inválido');
        } else {
          setLocalError(err.message || 'Error al unirse al equipo');
        }
      } else if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('Error al unirse al equipo');
      }
    }
  };

  if (isPending) return <LoadingSpinner />;

  if (statusLoading) return <LoadingSpinner />;

  if (statusError) return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <p className="text-red-400">Error al cargar el estado: {statusErrorObj?.message || 'Error desconocido'}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Reintentar
      </button>
    </div>
  );

  return (
      <div className="p-8 bg-slate-900 min-h-screen text-white">
        <Breadcrumb items={[{ label: 'Onboarding' }, { label: 'Unirse al equipo' }]} />

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Unirse a un equipo</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md">
          <label className="block mb-2 text-sm text-slate-300">Código del equipo</label>
          <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 rounded mb-4 bg-slate-800 text-white"
              placeholder="Ingresa el código"
          />

          {localError && <div className="text-red-400 mb-4">{localError}</div>}

          <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
              disabled={isPending}
          >
            {isPending ? 'Uniéndose...' : 'Unirse al equipo'}
          </button>
        </form>

        {statusData?.rejectionCount !== undefined && (
            <p className="mt-6 text-sm text-slate-300">
              Te quedan {Math.max(0, 3 - (statusData.rejectionCount || 0))} intentos antes de ser suspendido
            </p>
        )}
      </div>
  );
};

export default JoinTeamPage;