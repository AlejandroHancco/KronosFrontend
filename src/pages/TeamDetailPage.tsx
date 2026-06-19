import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import {
  useGetTeam,
  useGetTeamMembers,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
  useApproveTeamMember,
  useRejectTeamMember,
  useGetTeamProjects,
  useGetTeamActivity,
} from '../hooks/useTeams';
import { useAuth } from '../hooks/useAuth';
import { KronosLayout } from '../components/kronos';
import {
  KronosPageHeader,
  KronosSection,
  KronosCard,
} from '../components/kronos';
import { KronosTabs, KronosTabContent } from '../components/kronos';
import { KronosTable, type KronosColumn } from '../components/kronos';
import { KronosButton } from '../components/kronos';
import { KronosBadge } from '../components/kronos';
import LoadingSpinner from '../components/LoadingSpinner';
import type { TeamMember, TeamProject, TeamActivity } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const [copiedCode, setCopiedCode] = useState(false);

  interface ConfirmAction {
    type: 'approve' | 'reject';
    userId: string;
    memberName: string;
  }
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data: team, isLoading: teamLoading } = useGetTeam(teamId!);
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembers(teamId!);
  const { data: projects = [], isLoading: projectsLoading } = useGetTeamProjects(teamId!);
  const { data: activities = [], isLoading: activitiesLoading } = useGetTeamActivity(teamId!);

  const updateRoleMutation = useUpdateTeamMemberRole();
  const removeMemberMutation = useRemoveTeamMember();
  const approveMemberMutation = useApproveTeamMember();
  const rejectMemberMutation = useRejectTeamMember();

  const currentUserMember = members.find((m) => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role;
  const isAdmin = currentUserRole === 'ADMIN';

  const approvedMembers = members.filter((m) => m.status === 'APPROVED');
  const pendingMembers = members.filter((m) => m.status === 'PENDING');

  if (!teamId) return <div>Team not found</div>;
  if (teamLoading) return <LoadingSpinner />;

  // ✅ Helper reutilizable
  const renderIfAdmin = (content: () => React.ReactNode) =>
      isAdmin ? content() : null;

  const handleCopyCode = async () => {
    if (team?.code) {
      await navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePromoteMember = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    await updateRoleMutation.mutateAsync({
      teamId,
      userId,
      role: newRole as 'ADMIN' | 'MEMBER',
    });
  };

  const handleRemoveMember = async (userId: string) => {
    if (confirm('¿Está seguro de que desea eliminar este miembro?')) {
      await removeMemberMutation.mutateAsync({ teamId, userId });
    }
  };

  const handleApproveMember = (userId: string, memberName: string) => {
    setConfirmAction({ type: 'approve', userId, memberName });
  };

  const handleRejectMember = (userId: string, memberName: string) => {
    setConfirmAction({ type: 'reject', userId, memberName });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') {
      await approveMemberMutation.mutateAsync({ teamId, userId: confirmAction.userId });
    } else {
      await rejectMemberMutation.mutateAsync({ teamId, userId: confirmAction.userId });
    }
    setConfirmAction(null);
  };

  // ✅ COLUMNAS

  const getMemberColumns = (): KronosColumn<TeamMember>[] => [
    { key: 'user.name', header: 'Nombre', sortable: true },
    { key: 'user.email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Rol',
      render: (value) => (
          <KronosBadge variant={value === 'ADMIN' ? 'primary' : 'default'}>
            {String(value)}
          </KronosBadge>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: () => (
          <KronosBadge variant="success">Aprobado</KronosBadge>
      ),
    },
    {
      key: 'id',
      header: 'Acciones',
      align: 'right' as const,
      render: (_: unknown, row: TeamMember) =>
          renderIfAdmin(() => (
              <div className="flex gap-2 justify-end">
                <KronosButton
                    size="sm"
                    variant="outline"
                    onClick={() => handlePromoteMember(row.userId, row.role)}
                    loading={updateRoleMutation.isPending}
                >
                  {row.role === 'ADMIN' ? 'Degradar' : 'Promover'}
                </KronosButton>
                <KronosButton
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveMember(row.userId)}
                    loading={removeMemberMutation.isPending}
                >
                  Eliminar
                </KronosButton>
              </div>
          )),
    },
  ];

  const getRequestColumns = (): KronosColumn<TeamMember>[] => [
    { key: 'user.name', header: 'Nombre', sortable: true },
    { key: 'user.email', header: 'Email', sortable: true },
    {
      key: 'id',
      header: 'Solicitado en',
      render: () => new Date().toLocaleDateString(),
    },
    {
      key: 'id',
      header: 'Acciones',
      align: 'right' as const,
      render: (_: unknown, row: TeamMember) =>
          renderIfAdmin(() => (
              <div className="flex gap-2 justify-end">
                <KronosButton
                    size="sm"
                    variant="primary"
                    onClick={() => handleApproveMember(row.userId, row.user.name)}
                >
                  Aprobar
                </KronosButton>
                <KronosButton
                    size="sm"
                    variant="danger"
                    onClick={() => handleRejectMember(row.userId, row.user.name)}
                >
                  Rechazar
                </KronosButton>
              </div>
          )),
    },
  ];

  const getProjectColumns = (): KronosColumn<TeamProject>[] => [
    { key: 'name', header: 'Nombre', sortable: true },
    {
      key: 'status',
      header: 'Estado',
      render: (value) => {
        const variantMap = {
          active: 'success',
          draft: 'default',
          inactive: 'warning',
          archived: 'danger',
        } as const;

        return (
            <KronosBadge variant={variantMap[value as keyof typeof variantMap]}>
              {String(value)}
            </KronosBadge>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Creado en',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'uuid',
      header: 'Acciones',
      align: 'right' as const,
      render: (value) => (
          <KronosButton
              size="sm"
              variant="ghost"
              onClick={() => navigate(`/projects/${value}`)}
          >
            Ver Detalles
          </KronosButton>
      ),
    },
  ];

  const getActivityColumns = (): KronosColumn<TeamActivity>[] => [
    { key: 'memberName', header: 'Miembro', sortable: true },
    { key: 'taskName', header: 'Tarea', sortable: true },
    {
      key: 'takenAt',
      header: 'Realizado en',
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    { key: 'analyzerName', header: 'Analizador' },
    { key: 'points', header: 'Puntos', align: 'right' as const },
  ];

  const tabs = [
    { value: 'members', label: 'Miembros' },
    ...(isAdmin
        ? [{ value: 'requests', label: 'Solicitudes', badge: pendingMembers.length }]
        : []),
    { value: 'projects', label: 'Proyectos' },
    { value: 'activity', label: 'Actividad' },
  ];

  return (
    <>
      <KronosLayout title={team?.name} subtitle="Gestión del equipo">
        <KronosSection>
          <KronosPageHeader
              title={team?.name || 'Team'}
              description={`Código: ${team?.code}`}
              actions={
                <KronosButton
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    rightIcon={
                      copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
                    }
                >
                  {copiedCode ? 'Copiado' : 'Copiar Código'}
                </KronosButton>
              }
          />
        </KronosSection>

        <KronosSection className="mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tu Rol:</span>
            <KronosBadge variant={isAdmin ? 'primary' : 'default'}>
              {currentUserRole || 'Sin rol'}
            </KronosBadge>
          </div>
        </KronosSection>

        <KronosCard className="mt-6">
          <KronosTabs tabs={tabs} variant="default">
            <KronosTabContent value="members">
              {membersLoading ? (
                  <LoadingSpinner />
              ) : approvedMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">
                    No hay miembros aprobados
                  </p>
              ) : (
                  <KronosTable columns={getMemberColumns()} data={approvedMembers} />
              )}
            </KronosTabContent>

            {isAdmin && (
                <KronosTabContent value="requests">
                  {membersLoading ? (
                      <LoadingSpinner />
                  ) : pendingMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-8">
                        No hay solicitudes
                      </p>
                  ) : (
                      <KronosTable columns={getRequestColumns()} data={pendingMembers} />
                  )}
                </KronosTabContent>
            )}

            <KronosTabContent value="projects">
              {projectsLoading ? (
                  <LoadingSpinner />
              ) : (
                  <KronosTable columns={getProjectColumns()} data={projects} />
              )}
            </KronosTabContent>

            <KronosTabContent value="activity">
              {activitiesLoading ? (
                  <LoadingSpinner />
              ) : (
                  <KronosTable columns={getActivityColumns()} data={activities} />
              )}
            </KronosTabContent>
          </KronosTabs>
        </KronosCard>
      </KronosLayout>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'approve'
                ? `¿Estás seguro que deseas aprobar a ${confirmAction?.memberName}?`
                : `¿Estás seguro que deseas rechazar a ${confirmAction?.memberName}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <KronosButton variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </KronosButton>
            <KronosButton
              variant={confirmAction?.type === 'approve' ? 'primary' : 'danger'}
              onClick={handleConfirmAction}
              loading={
                confirmAction?.type === 'approve'
                  ? approveMemberMutation.isPending
                  : rejectMemberMutation.isPending
              }
            >
              Confirmar
            </KronosButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}