import { useState } from 'react';
import { useGetProjects } from '../hooks/useProjects';
import { useGetAllDevices } from '../hooks/useDevices';
import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosBadge,
    KronosButton,
    KronosSection,
} from '../components/kronos';
import {
    Cpu,
    Layers,
    RefreshCw,
    Wifi,
    WifiOff,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Network,
} from 'lucide-react';
import type {Device, DeviceStatus,DeviceResponse} from "../types/device.types.ts";

// ── Types ──────────────────────────────────────────────────────────────────────




interface Project {
    uuid: string;
    name: string;
    description?: string;
    role?: string; // 'admin' | 'viewer' | etc.
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const statusConfig: Record<DeviceStatus, {
    variant: 'success' | 'danger' | 'warning';
    label: string;
    icon: React.ElementType;
    dot: string;
}> = {
    online:      { variant: 'success', label: 'Online',      icon: Wifi,          dot: 'bg-green-500' },
    offline:     { variant: 'danger',  label: 'Offline',     icon: WifiOff,       dot: 'bg-red-500'   },
    unchecked:     { variant: 'warning', label: 'Unchecked',icon: AlertTriangle, dot: 'bg-yellow-500'},
};

const typeIcon: Record<string, React.ElementType> = {
    analyzer: Cpu,
    mux:      Layers,
};

const typeLabel: Record<string, string> = {
    analyzer: 'Analyzer',
    mux:      'MUX',
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const DeviceCard = ({ device }: { device: Device }) => {
    const status  = statusConfig[device.status] ?? statusConfig.offline;
    const type    = (device.type ?? 'analyzer').toLowerCase();
    const Icon    = typeIcon[type]  ?? Cpu;
    const tLabel  = typeLabel[type] ?? device.type ?? '—';
    const StatusIcon = status.icon;

    return (
        <KronosCard className="flex items-center gap-4">
            {/* Type icon */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Icon className="size-4 text-primary" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{device.name}</p>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
            {tLabel}
          </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                    {device.ip ?? 'Sin IP asignada'}
                </p>
                {device.createdAt && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Registrado: {new Date(device.createdAt).toLocaleDateString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                    })}
                    </p>
                )}
            </div>

            {/* Status */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <KronosBadge variant={status.variant} dot size="sm">
                    {status.label}
                </KronosBadge>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <StatusIcon className="size-3" />
                    <span className="text-[10px]">{device.ip ? device.ip : '—'}</span>
                </div>
            </div>
        </KronosCard>
    );
};

// ── Project group ──────────────────────────────────────────────────────────────

const ProjectDeviceGroup = ({
                                project,
                                devices,
                            }: {
    project: Project;
    devices: DeviceResponse[];
}) => {
    const [expanded, setExpanded] = useState(true);

    const analyzers = devices.filter(d => d.type?.toLowerCase() === 'analyzer');
    const muxes     = devices.filter(d => d.type?.toLowerCase() === 'mux');
    const others    = devices.filter(d => !['analyzer', 'mux'].includes(d.type?.toLowerCase() ?? ''));

    const onlineCount  = devices.filter(d => d.status === 'online').length;
    const uncheckedCount = devices.filter(d => d.status === 'unchecked').length;
    const offlineCount = devices.filter(d => d.status === 'offline').length;

    return (
        <div className="rounded-lg border border-border overflow-hidden">

            {/* Group header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
                {expanded
                    ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                }

                <Network className="size-4 text-primary shrink-0" />

                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{project.name}</span>
                    {project.role && (
                        <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              ({project.role})
            </span>
                    )}
                </div>

                {/* Mini status summary */}
                <div className="flex items-center gap-2 shrink-0">
                    {onlineCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-green-500">
              <span className="size-1.5 rounded-full bg-green-500 inline-block" />
                            {onlineCount}
            </span>
                    )}
                    {uncheckedCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-yellow-500">
              <span className="size-1.5 rounded-full bg-yellow-500 inline-block" />
                            {uncheckedCount}
            </span>
                    )}
                    {offlineCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-red-500">
              <span className="size-1.5 rounded-full bg-red-500 inline-block" />
                            {offlineCount}
            </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-1">
            {devices.length} dispositivo{devices.length !== 1 ? 's' : ''}
          </span>
                </div>
            </button>

            {/* Device lists */}
            {expanded && (
                <div className="p-4 space-y-5">

                    {devices.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                            Este proyecto no tiene dispositivos registrados.
                        </p>
                    )}

                    {analyzers.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Cpu className="size-3" /> Analyzers
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {analyzers.map(d => <DeviceCard key={d.id} device={d} />)}
                            </div>
                        </div>
                    )}

                    {muxes.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Layers className="size-3" /> MUX
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {muxes.map(d => <DeviceCard key={d.id} device={d} />)}
                            </div>
                        </div>
                    )}

                    {others.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Otros
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {others.map(d => <DeviceCard key={d.id} device={d} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Page ───────────────────────────────────────────────────────────────────────

const SensorsPage = () => {
    const { data: projects, isLoading: projectsLoading } = useGetProjects();
    const { data: devices,  isLoading: devicesLoading, refetch } = useGetAllDevices();

    const isLoading = projectsLoading || devicesLoading;

    // Global counts for the header stats
    const totalDevices      = devices?.length ?? 0;
    const onlineDevices     = devices?.filter(d => d.status === 'online').length     ?? 0;
    const uncheckedDevices    = devices?.filter(d => d.status === 'unchecked').length    ?? 0;
    const offlineDevices    = devices?.filter(d => d.status === 'offline').length    ?? 0;

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
    );

    return (
        <KronosLayout title="Sensors" subtitle="Device Management">
            <KronosPageHeader
                title="Dispositivos"
                description="Analyzers y MUX asociados a tus proyectos"
                actions={
                    <KronosButton
                        variant="outline"
                        size="sm"
                        leftIcon={<RefreshCw className="size-4" />}
                        onClick={() => refetch()}
                    >
                        Actualizar
                    </KronosButton>
                }
            />

            {/* ── Summary stats ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <KronosCard className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Cpu className="size-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-foreground leading-none">{totalDevices}</p>
                    </div>
                </KronosCard>

                <KronosCard className="flex items-center gap-3">
                    <div className="size-2.5 shrink-0 rounded-full bg-green-500" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Online</p>
                        <p className="text-lg font-bold text-green-500 leading-none">{onlineDevices}</p>
                    </div>
                </KronosCard>

                <KronosCard className="flex items-center gap-3">
                    <div className="size-2.5 shrink-0 rounded-full bg-yellow-500" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unchecked</p>
                        <p className="text-lg font-bold text-yellow-500 leading-none">{uncheckedDevices}</p>
                    </div>
                </KronosCard>

                <KronosCard className="flex items-center gap-3">
                    <div className="size-2.5 shrink-0 rounded-full bg-red-500" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Offline</p>
                        <p className="text-lg font-bold text-red-500 leading-none">{offlineDevices}</p>
                    </div>
                </KronosCard>

            </div>

            {/* ── Project groups ── */}
            <KronosSection
                title="Por proyecto"
                description="Dispositivos agrupados por proyecto"
            >
                <div className="space-y-4">
                    {projects?.map(project => (
                        <ProjectDeviceGroup
                            key={project.uuid}
                            project={project}
                            devices={devices?.filter(d => d.projectId === project.uuid) ?? []}
                        />
                    ))}

                    {(!projects || projects.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-10">
                            No tienes proyectos asignados.
                        </p>
                    )}
                </div>
            </KronosSection>

        </KronosLayout>
    );
};

export default SensorsPage;