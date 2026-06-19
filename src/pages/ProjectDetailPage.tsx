import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useGetTasks } from '../hooks/useTasks';
import { useGetProject, useGetProjects } from '../hooks/useProjects';
import CreateTaskModal from './modals/CreateTaskModal';
import { useGetProjectDevices } from '../hooks/useTasks';

import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosButton,
    KronosBadge,
    KronosSection,
} from '../components/kronos';
// FIX 4: Layers añadido al import
import { ArrowLeft, Plus, Cpu, FolderOpen, Calendar, ChevronRight, ChevronLeft, Layers } from 'lucide-react';

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

const PAGE_SIZE = 10;

const ProjectDetailPage = () => {
    const { projectId: id } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [showAll, setShowAll] = useState(false);
    const [page, setPage] = useState(1);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
    const taskCarouselRef = useRef<HTMLDivElement>(null);
    const [showTaskLeftArrow, setShowTaskLeftArrow] = useState(false);
    const [showTaskRightArrow, setShowTaskRightArrow] = useState(false);

    // FIX 1: Cambiado projectId! → id! (projectId no existía como variable)
    const { data: projectDevices } = useGetProjectDevices(id!);

    // FIX 5: Todos los hooks agrupados antes de cualquier early return
    const { data: tasksData, isLoading: tasksLoading, isError: tasksError, error: tasksErrorMsg } = useGetTasks(id!, page);
    const { data: recentData } = useGetTasks(id!, 1, 5);
    const { data: project, isLoading: projectLoading, isError: projectError, error: projectErrorMsg } = useGetProject(id!);
    const { data: allProjects } = useGetProjects();

    const analyzers = projectDevices?.filter(d => d.type === 'analyzer') ?? [];
    const muxes = projectDevices?.filter(d => d.type === 'mux') ?? [];

    const updateTaskArrows = () => {
        const el = taskCarouselRef.current;
        if (!el) return;
        setShowTaskLeftArrow(el.scrollLeft > 0);
        setShowTaskRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    const scrollTaskCarousel = (direction: 'left' | 'right') => {
        if (!taskCarouselRef.current) return;
        taskCarouselRef.current.scrollBy({
            left: direction === 'left' ? -280 : 280,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const el = taskCarouselRef.current;
        if (!el) return;
        updateTaskArrows();
        const observer = new ResizeObserver(() => updateTaskArrows());
        observer.observe(el);
        return () => observer.disconnect();
    }, [recentData]);

    // Early returns DESPUÉS de todos los hooks
    if (tasksLoading || projectLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
    );

    if (tasksError || projectError) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-destructive">Error: {tasksErrorMsg?.message || projectErrorMsg?.message}</p>
        </div>
    );

    const top5Tasks = recentData?.items ?? [];
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

    return (
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

                    {/* ── Top 5 tareas recientes ── */}
                    <KronosSection title="Tareas Recientes" description="Las 5 últimas tareas monitorizadas">
                        <div className="relative">
                            <div className={`absolute -left-3 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                                showTaskLeftArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                            }`}>
                                <button
                                    onClick={() => scrollTaskCarousel('left')}
                                    className="flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-200"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                            </div>

                            <div
                                ref={taskCarouselRef}
                                onScroll={updateTaskArrows}
                                className="flex gap-4 overflow-x-auto scroll-smooth px-1 py-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {top5Tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
                                        className="cursor-pointer flex-none w-[260px]"
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
                                    className="cursor-pointer group flex-none w-[260px]"
                                >
                                    <KronosCard className="border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-2 min-h-[100px] h-full">
                                        <span className="text-2xl text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-in-out select-none">+</span>
                                        <p className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                                            Nueva tarea
                                        </p>
                                    </KronosCard>
                                </div>
                            </div>

                            <div className={`absolute -right-3 top-1/2 -translate-y-1/2 z-10 transition-all duration-200 ${
                                showTaskRightArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                            }`}>
                                <button
                                    onClick={() => scrollTaskCarousel('right')}
                                    className="flex size-7 items-center justify-center rounded-full border border-border bg-background shadow-md text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-200"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </KronosSection>

                    {/* FIX 2: Sección Dispositivos movida dentro del return JSX */}
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
                                        {/* FIX 3: Eliminada referencia a `task` — "isActive" ahora
                                            depende solo del device. Adapta esta lógica según tu
                                            modelo de datos real (ej. device.isActive, device.status, etc.) */}
                                        {analyzers.map((device) => {
                                            const isActive = device.status === 'online';                                            return (
                                                <div
                                                    key={device.id}
                                                    className={`flex items-center justify-between rounded-md px-3 py-2 border transition-colors ${
                                                        isActive
                                                            ? 'border-primary/40 bg-primary/5'
                                                            : 'border-border bg-muted/20'
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
                                            const isActive = device.status === 'online';                                            return (
                                                <div
                                                    key={device.id}
                                                    className={`flex items-center justify-between rounded-md px-3 py-2 border transition-colors ${
                                                        isActive
                                                            ? 'border-primary/40 bg-primary/5'
                                                            : 'border-border bg-muted/20'
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

                    {/* ── Todas las tareas (tabla) ── */}
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

                {/* Right — Otros proyectos (1/3) */}
                <div className="space-y-6">
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
                </div>
            </div>

            {showCreateTaskModal && (
                <CreateTaskModal
                    projectId={id!}
                    onClose={() => setShowCreateTaskModal(false)}
                />
            )}
        </KronosLayout>
    );
};

export default ProjectDetailPage;