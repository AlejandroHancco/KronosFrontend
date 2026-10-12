import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { useGetTasks } from '../hooks/useTasks';
import { useGetProject, useGetProjects, useGetProjectMembers, useUpdateProjectMemberRole, useAddProjectMember } from '../hooks/useProjects';
import { useGetCurrentTeam, useGetTeamMembers } from '../hooks/useTeams';
import { useIsSuperAdmin } from '../hooks/useIsSuperAdmin';
import CreateTaskModal from './modals/CreateTaskModal';
import MemberExtraPermissionsModal from './modals/MemberExtraPermissionsModal';
import { useGetProjectDevices } from '../hooks/useTasks';

import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosButton,
    KronosBadge,
    KronosSection,
} from '../components/kronos';
import { ArrowLeft, Plus, Cpu, FolderOpen, Calendar, ChevronRight, ChevronLeft, Layers, Users, ShieldCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import type { ProjectMember } from '../types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    completed: 'success',
    pending: 'warning',
    in_progress: 'info',
    cancelled: 'danger',
};

const statusLabel: Record<string, string> = {
    completed: 'Completado',
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    cancelled: 'Cancelado',
};

const PROJECT_ROLES = [
    { id: 3, label: 'Gestor de Proyecto' },
    { id: 4, label: 'Operario' },
    { id: 5, label: 'Visualizador' },
] as const;

const PAGE_SIZE = 10;

const ProjectDetailPage = () => {
    const { projectId: id } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    const [page, setPage] = useState(1);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [addMemberUserId, setAddMemberUserId] = useState('');
    const [addMemberRoleId, setAddMemberRoleId] = useState<number>(4);
    const [permissionsMember, setPermissionsMember] = useState<ProjectMember | null>(null);
    const isSuperAdmin = useIsSuperAdmin();

    const { data: projectDevices } = useGetProjectDevices(id!);
    const { data: tasksData, isLoading: tasksLoading, isError: tasksError, error: tasksErrorMsg } = useGetTasks(id!, page);
    const { data: recentData } = useGetTasks(id!, 1, 3);
    const { data: project, isLoading: projectLoading, isError: projectError, error: projectErrorMsg } = useGetProject(id!);
    const { data: allProjects } = useGetProjects();
    const { data: projectMembers = [], isLoading: projectMembersLoading } = useGetProjectMembers(id!);
    const { data: currentTeam } = useGetCurrentTeam();
    const { data: teamMembers = [] } = useGetTeamMembers(currentTeam?.id ?? '');
    const updateProjectRoleMutation = useUpdateProjectMemberRole();
    const addProjectMemberMutation = useAddProjectMember();

    const analyzers = projectDevices?.filter(d => d.type === 'analyzer') ?? [];
    const muxes = projectDevices?.filter(d => d.type === 'mux') ?? [];

    // Team members not yet in the project
    const approvedTeamMembers = teamMembers.filter(m => m.status === 'APPROVED');
    const membersNotInProject = approvedTeamMembers.filter(
        tm => !projectMembers.some(pm => pm.userId === tm.userId)
    );

    if (tasksLoading || projectLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
    );

    if (tasksError || projectError) {
        const err = projectErrorMsg ?? tasksErrorMsg;
        const status = err instanceof AxiosError ? err.response?.status : undefined;
        if (status === 404) return <Navigate to="/404" replace />;
        if (status === 403) return <Navigate to="/403" replace />;
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-destructive">
                    {status && status >= 500
                        ? 'Error del servidor, intenta de nuevo'
                        : `Error: ${err?.message}`}
                </p>
            </div>
        );
    }

    const recentTasks = recentData?.items ?? [];
    const paginatedTasks = tasksData?.items ?? [];
    const total = tasksData?.total ?? 0;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const top5Projects = allProjects?.filter(p => p.uuid !== id).slice(0, 5) ?? [];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleChangeProjectRole = async (userId: string, roleId: number) => {
        await updateProjectRoleMutation.mutateAsync({ projectId: id!, userId, roleId });
    };

    const handleAddMember = async () => {
        if (!addMemberUserId) return;
        await addProjectMemberMutation.mutateAsync({ projectId: id!, userId: addMemberUserId, roleId: addMemberRoleId });
        setShowAddMemberModal(false);
        setAddMemberUserId('');
        setAddMemberRoleId(4);
    };

    const getRoleLabel = (roleId: number) =>
        PROJECT_ROLES.find(r => r.id === roleId)?.label ?? `Rol ${roleId}`;

    return (
        <>
        <KronosLayout title={project?.name ?? 'Proyecto'} subtitle="Detalle del Proyecto">
            <KronosPageHeader
                title={project?.name ?? 'Proyecto'}
                description={project?.description}
                actions={
                    <>
                        <KronosButton
                            variant="outline"
                            size="sm"
                            leftIcon={<ArrowLeft className="size-4" />}
                            onClick={() => navigate('/dashboard')}
                        >
                            Volver
                        </KronosButton>
                        <KronosButton
                            variant="outline"
                            size="sm"
                            leftIcon={<Cpu className="size-4" />}
                            onClick={() => navigate(`/projects/${id}/devices`)}
                        >
                            Dispositivos
                        </KronosButton>
                        <KronosButton
                            size="sm"
                            leftIcon={<Plus className="size-4" />}
                            onClick={() => navigate(`/projects/${id}/tasks/new`)}
                        >
                            Nueva Tarea
                        </KronosButton>
                    </>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left (2/3) */}
                <div className="space-y-6 lg:col-span-2">

                    {/* ── Tareas recientes: límite de 3 + tarjeta de nueva tarea ── */}
                    <KronosSection title="Tareas Recientes" description="Las 3 últimas tareas monitorizadas">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {recentTasks.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
                                    className="cursor-pointer"
                                >
                                    <KronosCard className="hover:border-primary transition-colors min-h-[100px] h-full flex flex-col justify-between gap-2">
                                        <div>
                                            <h2 className="text-sm font-semibold text-foreground">{task.name}</h2>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <Calendar className="size-3" />
                                                {formatDate(task.createdAt)}
                                            </p>
                                        </div>
                                        <KronosBadge variant={statusVariant[task.status] ?? 'default'} dot size="sm">
                                            {statusLabel[task.status] ?? task.status}
                                        </KronosBadge>
                                    </KronosCard>
                                </div>
                            ))}

                            <div
                                onClick={() => setShowCreateTaskModal(true)}
                                className="cursor-pointer group"
                            >
                                <KronosCard className="border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-2 min-h-[100px] h-full">
                                    <span className="text-2xl text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-in-out select-none">+</span>
                                    <p className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                                        Nueva tarea
                                    </p>
                                </KronosCard>
                            </div>
                        </div>
                    </KronosSection>

                    {/* Dispositivos */}
                    <KronosSection title="Dispositivos" description="Dispositivos asignados al proyecto">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Analizadores */}
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">Analizadores</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {analyzers.length} dispositivo{analyzers.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                                        <Cpu className="size-3.5 text-primary" />
                                    </div>
                                </div>
                                {analyzers.length > 0 ? (
                                    <div className="space-y-2">
                                        {analyzers.map((device) => {
                                            const isActive = device.status === 'online';
                                            return (
                                                <div
                                                    key={device.id}
                                                    className={`flex items-center justify-between rounded-md px-3 py-2 border transition-colors ${
                                                        isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`size-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">{device.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{device.ip ?? 'Sin IP'}</p>
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                            Activo
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No hay analizadores en este proyecto.</p>
                                )}
                            </div>

                            {/* MUXes */}
                            <div className="rounded-lg border border-border bg-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-semibold text-foreground">MUX</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {muxes.length} dispositivo{muxes.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                                        <Layers className="size-3.5 text-primary" />
                                    </div>
                                </div>
                                {muxes.length > 0 ? (
                                    <div className="space-y-2">
                                        {muxes.map((device) => {
                                            const isActive = device.status === 'online';
                                            return (
                                                <div
                                                    key={device.id}
                                                    className={`flex items-center justify-between rounded-md px-3 py-2 border transition-colors ${
                                                        isActive ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`size-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                                        <div>
                                                            <p className="text-xs font-medium text-foreground">{device.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{device.ip ?? 'Sin IP'}</p>
                                                        </div>
                                                    </div>
                                                    {isActive && (
                                                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                            Activo
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">No hay MUX en este proyecto.</p>
                                )}
                            </div>
                        </div>
                    </KronosSection>

                    {/* ── Todas las tareas ── */}
                    <KronosSection
                        title="Todas las Tareas"
                        description={`${total} tareas en total`}
                    >
                        <div className="flex justify-end mb-3">
                            <KronosButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowAll(v => !v);
                                    setPage(1);
                                }}
                            >
                                {showAll ? 'Ocultar' : 'Ver todas las tareas'}
                            </KronosButton>
                        </div>

                        {showAll && (
                            <KronosCard className="p-0 overflow-hidden">
                                {paginatedTasks.length > 0 ? (
                                    <>
                                        <table className="w-full text-sm">
                                            <thead>
                                            <tr className="border-b border-border bg-muted/40">
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha de creación</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {paginatedTasks.map((task, index) => (
                                                <tr
                                                    key={task.id}
                                                    onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
                                                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                                        index !== paginatedTasks.length - 1 ? 'border-b border-border' : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 font-medium text-foreground">{task.name}</td>
                                                    <td className="px-4 py-3">
                                                        <KronosBadge variant={statusVariant[task.status] ?? 'default'} dot size="sm">
                                                            {statusLabel[task.status] ?? task.status}
                                                        </KronosBadge>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="size-3.5" />
                                                            {formatDate(task.createdAt)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>

                                        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                                            <p className="text-xs text-muted-foreground">
                                                Mostrando{' '}
                                                <span className="font-medium text-foreground">{(page - 1) * PAGE_SIZE + 1}</span>
                                                {' '}–{' '}
                                                <span className="font-medium text-foreground">{Math.min(page * PAGE_SIZE, total)}</span>
                                                {' '}de{' '}
                                                <span className="font-medium text-foreground">{total}</span>
                                                {' '}tareas
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <KronosButton
                                                    variant="outline"
                                                    size="sm"
                                                    leftIcon={<ChevronLeft className="size-3.5" />}
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={page === 1}
                                                >
                                                    Anterior
                                                </KronosButton>

                                                <div className="flex items-center gap-1 mx-1">
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                                            acc.push(p);
                                                            return acc;
                                                        }, [])
                                                        .map((p, idx) =>
                                                            p === '...' ? (
                                                                <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">…</span>
                                                            ) : (
                                                                <button
                                                                    key={p}
                                                                    onClick={() => setPage(p as number)}
                                                                    className={`h-7 min-w-[28px] rounded text-xs font-medium transition-colors px-2 ${
                                                                        page === p
                                                                            ? 'bg-primary text-primary-foreground'
                                                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                    }`}
                                                                >
                                                                    {p}
                                                                </button>
                                                            )
                                                        )
                                                    }
                                                </div>

                                                <KronosButton
                                                    variant="outline"
                                                    size="sm"
                                                    rightIcon={<ChevronRight className="size-3.5" />}
                                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={page === totalPages}
                                                >
                                                    Siguiente
                                                </KronosButton>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <p className="text-sm text-muted-foreground">No hay tareas aún.</p>
                                        <KronosButton
                                            size="sm"
                                            className="mt-4"
                                            leftIcon={<Plus className="size-4" />}
                                            onClick={() => navigate(`/projects/${id}/tasks/new`)}
                                        >
                                            Crear primera tarea
                                        </KronosButton>
                                    </div>
                                )}
                            </KronosCard>
                        )}
                    </KronosSection>
                </div>

                {/* Right (1/3) */}
                <div className="space-y-6">
                    {/* Otros proyectos */}
                    <KronosCard>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">Otros Proyectos</h3>
                            <KronosButton
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary"
                                onClick={() => navigate('/dashboard')}
                            >
                                Ver todos
                            </KronosButton>
                        </div>
                        {top5Projects.length > 0 ? (
                            <div className="space-y-2">
                                {top5Projects.map((proj) => (
                                    <div
                                        key={proj.uuid}
                                        onClick={() => navigate(`/projects/${proj.uuid}`)}
                                        className="flex items-center justify-between rounded-md p-2.5 cursor-pointer hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
                                                <FolderOpen className="size-3.5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-foreground">{proj.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatDate(proj.createdAt)}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No hay otros proyectos.</p>
                        )}
                    </KronosCard>

                    {/* ── Miembros del proyecto ── */}
                    <KronosCard>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="size-4 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">Miembros</h3>
                            </div>
                            <KronosButton
                                variant="outline"
                                size="sm"
                                leftIcon={<Plus className="size-3" />}
                                onClick={() => {
                                    setAddMemberUserId(membersNotInProject[0]?.userId ?? '');
                                    setShowAddMemberModal(true);
                                }}
                                disabled={membersNotInProject.length === 0}
                            >
                                Añadir
                            </KronosButton>
                        </div>

                        {projectMembersLoading ? (
                            <p className="text-xs text-muted-foreground">Cargando...</p>
                        ) : projectMembers.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No hay miembros en este proyecto.</p>
                        ) : (
                            <div className="space-y-2">
                                {projectMembers.map((member: ProjectMember) => (
                                    <div key={member.userId} className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium text-foreground">
                                                {member.user?.name ?? (member as any).name ?? member.userId}
                                            </p>
                                            <p className="truncate text-[10px] text-muted-foreground">
                                                {member.user?.email ?? (member as any).email ?? ''}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {(isSuperAdmin || member.roleName === 'Operario') && (
                                                <button
                                                    type="button"
                                                    title="Permisos extra"
                                                    onClick={() => setPermissionsMember(member)}
                                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                >
                                                    <ShieldCheck className="size-3.5" />
                                                </button>
                                            )}
                                            <select
                                                value={member.roleId}
                                                onChange={(e) => handleChangeProjectRole(member.userId, Number(e.target.value))}
                                                disabled={updateProjectRoleMutation.isPending}
                                                className="rounded-md border border-border bg-background px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                                            >
                                                {PROJECT_ROLES.map(role => (
                                                    <option key={role.id} value={role.id}>{role.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {projectMembers.length > 0 && (
                            <p className="mt-3 text-[10px] text-muted-foreground/60">
                                {projectMembers.length} miembro{projectMembers.length !== 1 ? 's' : ''} en el proyecto
                            </p>
                        )}
                    </KronosCard>
                </div>
            </div>

            {showCreateTaskModal && (
                <CreateTaskModal
                    projectId={id!}
                    onClose={() => setShowCreateTaskModal(false)}
                />
            )}
        </KronosLayout>

        {/* ── Modal: Añadir miembro al proyecto ── */}
        <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Añadir miembro al proyecto</DialogTitle>
                    <DialogDescription>
                        Selecciona un miembro del equipo y asígnale un rol en este proyecto.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Miembro</label>
                        {membersNotInProject.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Todos los miembros del equipo ya están en este proyecto.</p>
                        ) : (
                            <select
                                value={addMemberUserId}
                                onChange={(e) => setAddMemberUserId(e.target.value)}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                {membersNotInProject.map(tm => (
                                    <option key={tm.userId} value={tm.userId}>
                                        {tm.user?.name ?? (tm as any).name ?? tm.userId} — {tm.user?.email ?? (tm as any).email ?? ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Rol en el proyecto</label>
                        <select
                            value={addMemberRoleId}
                            onChange={(e) => setAddMemberRoleId(Number(e.target.value))}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {PROJECT_ROLES.map(role => (
                                <option key={role.id} value={role.id}>{role.label}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-muted-foreground">
                            Rol inicial: {getRoleLabel(addMemberRoleId)}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <KronosButton variant="outline" onClick={() => setShowAddMemberModal(false)}>
                        Cancelar
                    </KronosButton>
                    <KronosButton
                        variant="primary"
                        onClick={handleAddMember}
                        disabled={!addMemberUserId || membersNotInProject.length === 0}
                        loading={addProjectMemberMutation.isPending}
                    >
                        Añadir miembro
                    </KronosButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* ── Modal: Permisos extra de un miembro ── */}
        {permissionsMember && (
            <MemberExtraPermissionsModal
                projectId={id!}
                member={permissionsMember}
                onClose={() => setPermissionsMember(null)}
            />
        )}
        </>
    );
};

export default ProjectDetailPage;
