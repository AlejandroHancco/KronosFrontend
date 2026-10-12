import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb';
import { useGetCurrentTeam, useGetTeamMembers, useGetPendingTeamRequests, useApproveTeamRequest, useRejectTeamRequest } from '../../hooks/useTeams';
import { useAuth } from '../../hooks/useAuth';
import type { TeamMember } from '../../types';

const TeamRequestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: currentTeam, isLoading: teamLoading } = useGetCurrentTeam();
  const { data: allMembers, isLoading: membersLoading } = useGetTeamMembers(currentTeam?.id || '');
  const { data: requests, isLoading: requestsLoading } = useGetPendingTeamRequests(currentTeam?.id || '');
  const { mutateAsync: approve, isPending: approveLoading } = useApproveTeamRequest();
  const { mutateAsync: reject, isPending: rejectLoading } = useRejectTeamRequest();

  // Check if user is admin
  useEffect(() => {
    if (!user || !allMembers || !currentTeam) return;

    const currentUserMember = allMembers.find((m) => m.userId === user.id);
    const isAdmin = currentUserMember?.role === 'ADMIN';

    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [user, allMembers, currentTeam, navigate]);

  const handleApprove = async (memberId: string) => {
    try {
      await approve(memberId);
    } catch (err) {
      console.error('Error approving member:', err);
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      await reject(memberId);
    } catch (err) {
      console.error('Error rejecting member:', err);
    }
  };

  if (teamLoading || membersLoading || requestsLoading) return <LoadingSpinner />;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-white">
      <Breadcrumb items={[{ label: 'Administración' }, { label: 'Solicitudes de equipo' }]} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Solicitudes de nuevos miembros</h1>
      </div>

      {(!requests || requests.length === 0) ? (
        <div className="border border-slate-700 p-8 rounded bg-slate-800 text-center">
          <p className="text-slate-300">No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded bg-slate-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700 border-b border-slate-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Fecha de solicitud</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request: TeamMember) => (
                <tr key={request.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="px-6 py-4 text-sm">{request.user?.name ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">{request.user?.email ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(request.createdAt as string | undefined)}</td>
                  <td className="px-6 py-4 text-sm flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.userId)}
                      disabled={approveLoading || rejectLoading}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      {approveLoading ? 'Aprobando...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleReject(request.userId)}
                      disabled={approveLoading || rejectLoading}
                      className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                    >
                      {rejectLoading ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamRequestsPage;



