import { useState, useEffect } from 'react';
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

type ConfirmActionType = 'approve' | 'reject' | 'promote' | 'demote' | 'remove';

interface ConfirmAction {
  type: ConfirmActionType;
  userId: string;
  memberName: string;
}

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data: team,
    isLoading: teamLoading } = useGetTeam(teamId!);
  const { data: members = [], isLoading: membersLoading } = useGetTeamMembers(teamId!);
  const { data: projects = [], isLoading: projectsLoading } = useGetTeamProjects(teamId!);
  const { data: activities = [], isLoading: activitiesLoading } = useGetTeamActivity(teamId!);

  const updateRoleMutation = useUpdateTeamMemberRole();
  const removeMemberMutation = useRemoveTeamMember();
  const approveMemberMutation = useApproveTeamMember();
  const rejectMemberMutation = useRejectTeamMember();

  // ── Diagnóstico: eliminar cuando el backend devuelva user correctamente ──
  useEffect(() => {
    if (!members.length) return;
    console.log('[TeamDetailPage] members data:', members);
    console.log('[TeamDetailPage] primer member:', members[0]);
    console.log('[TeamDetailPage] member keys:', Object.keys(members[0]));
    console.log('[TeamDetailPage] member.user:', members[0].user);
  }, [members]);

  const currentUserMember = members.find((m) => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role;
  const isAdmin = currentUserRole === 'ADMIN';

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      ADMIN: 'Administrador de Equipo',
      MEMBER: 'Miembro',
    };
    return names[role] ?? role;
  };

  // Extrae el nombre aunque el backend retorne la estructura plana o anidada
  const getMemberName = (m: TeamMember): string =>
    m.user?.name ?? (m['name'] as string | undefined) ?? m.userId;

  const getMemberEmail = (m: TeamMember): string =>
    m.user?.email ?? (m['email'] as string | undefined) ?? '';

  const approvedMembers = members.filter((m) => m.status === 'APPROVED');
  const pendingMembers = members.filter((m) => m.status === 'PENDING');

  if (!teamId) return <div>Team not found</div>;
  if (teamLoading) return <LoadingSpinner />;

  const renderIfAdmin = (content: () => React.ReactNode) =>
    isAdmin ? content() : null;

  const handleCopyCode = async () => {
    if (team?.code) {
      await navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction || !teamId) return;
    switch (confirmAction.type) {
      case 'approve':
        await approveMemberMutation.mutateAsync({ teamId, userId: confirmAction.userId });
        break;
      case 'reject':
        await rejectMemberMutation.mutateAsync({ teamId, userId: confirmAction.userId });
        break;
      case 'promote':
        await updateRoleMutation.mutateAsync({ teamId, userId: confirmAction.userId, role: 'ADMIN' });
        break;
      case 'demote':
        await updateRoleMutation.mutateAsync({ teamId, userId: confirmAction.userId, role: 'MEMBER' });
        break;
      case 'remove':
        await removeMemberMutation.mutateAsync({ teamId, userId: confirmAction.userId });
        break;
    }
    setConfirmAction(null);
  };

  const dialogTitle: Record<ConfirmActionType, string> = {
    approve: 'Aprobar solicitud',
    reject: 'Rechazar solicitud',
    promote: 'Promover a Administrador',
    demote: 'Degradar a Miembro',
    remove: 'Eliminar miembro',
  };

  const dialogDescription: Record<ConfirmActionType, string> = {
    approve: `¿Estás seguro que deseas aprobar a ${confirmAction?.memberName}?`,
    reject: `¿Estás seguro que deseas rechazar a ${confirmAction?.memberName}?`,
    promote: `¿Estás seguro que deseas promover a ${confirmAction?.memberName} a Administrador de Equipo?`,
    demote: `¿Estás seguro que deseas degradar a ${confirmAction?.memberName} a Miembro?`,
    remove: `¿Estás seguro que deseas eliminar a ${confirmAction?.memberName} del equipo?`,
  };

  const confirmButtonVariant = (type: ConfirmActionType | undefined) => {
    if (type === 'approve' || type === 'promote') return 'primary' as const;
    return 'danger' as const;
  };

  const confirmButtonLoading = () => {
    switch (confirmAction?.type) {
      case 'approve': return approveMemberMutation.isPending;
      case 'reject': return rejectMemberMutation.isPending;
      case 'promote':
      case 'demote': return updateRoleMutation.isPending;
      case 'remove': return removeMemberMutation.isPending;
      default: return false;
    }
  };

  // ── Columnas ──

  const getMemberColumns = (): KronosColumn<TeamMember>[] => [
    {
      key: 'user.name',
      header: 'Nombre',
      sortable: true,
      render: (_: unknown, row: TeamMember) => getMemberName(row),
    },
    {
      key: 'user.email',
      header: 'Email',
      sortable: true,
      render: (_: unknown, row: TeamMember) => getMemberEmail(row),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (value) => (
        <KronosBadge variant={value === 'ADMIN' ? 'primary' : 'default'}>
          {getRoleName(String(value))}
        </KronosBadge>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: () => <KronosBadge variant="success">Aprobado</KronosBadge>,
    },
    {
      key: 'id',
      header: 'Acciones',
      align: 'right' as const,
      render: (_: unknown, row: TeamMember) =>
        row.userId === currentUserId
          ? null
          : renderIfAdmin(() => (
              <div className="flex gap-2 justify-end">
                {row.role === 'MEMBER' ? (
                  <KronosButton
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConfirmAction({ type: 'promote', userId: row.userId, memberName: getMemberName(row) })
                    }
                    loading={updateRoleMutation.isPending}
                  >
                    Promover a Admin
                  </KronosButton>
                ) : (
                  <KronosButton
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setConfirmAction({ type: 'demote', userId: row.userId, memberName: getMemberName(row) })
                    }
                    loading={updateRoleMutation.isPending}
                  >
                    Degradar a Miembro
                  </KronosButton>
                )}
                <KronosButton
                  size="sm"
                  variant="danger"
                  onClick={() =>
                    setConfirmAction({ type: 'remove', userId: row.userId, memberName: getMemberName(row) })
                  }
                  loading={removeMemberMutation.isPending}
                >
                  Eliminar
                </KronosButton>
              </div>
            )),
    },
  ];

  const getRequestColumns = (): KronosColumn<TeamMember>[] => [
    {
      key: 'user.name',
      header: 'Nombre',
      sortable: true,
      render: (_: unknown, row: TeamMember) => getMemberName(row),
    },
    {
      key: 'user.email',
      header: 'Email',
      sortable: true,
      render: (_: unknown, row: TeamMember) => getMemberEmail(row),
    },
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
              onClick={() =>
                setConfirmAction({ type: 'approve', userId: row.userId, memberName: getMemberName(row) })
              }
            >
              Aprobar
            </KronosButton>
            <KronosButton
              size="sm"
              variant="danger"
              onClick={() =>
                setConfirmAction({ type: 'reject', userId: row.userId, memberName: getMemberName(row) })
              }
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
        <KronosButton size="sm" variant="ghost" onClick={() => navigate(`/projects/${value}`)}>
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
    ...(isAdmin ? [{ value: 'requests', label: 'Solicitudes', badge: pendingMembers.length }] : []),
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
                rightIcon={copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
              {currentUserRole ? getRoleName(currentUserRole) : 'Sin rol'}
            </KronosBadge>
          </div>
        </KronosSection>

        <KronosCard className="mt-6">
          <KronosTabs tabs={tabs} variant="default">
            <KronosTabContent value="members">
              {membersLoading ? (
                <LoadingSpinner />
              ) : approvedMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">No hay miembros aprobados</p>
              ) : (
                <KronosTable columns={getMemberColumns()} data={approvedMembers} />
              )}
            </KronosTabContent>

            {isAdmin && (
              <KronosTabContent value="requests">
                {membersLoading ? (
                  <LoadingSpinner />
                ) : pendingMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8">No hay solicitudes</p>
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
            <DialogTitle>{confirmAction ? dialogTitle[confirmAction.type] : ''}</DialogTitle>
            <DialogDescription>
              {confirmAction ? dialogDescription[confirmAction.type] : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <KronosButton variant="outline" onClick={() => setConfirmAction(null)}>
              Cancelar
            </KronosButton>
            <KronosButton
              variant={confirmButtonVariant(confirmAction?.type)}
              onClick={handleConfirmAction}
              loading={confirmButtonLoading()}
            >
              Confirmar
            </KronosButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
