import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import CreateProjectModal from './modals/CreateProjectModal';
import { useGetProjects, useGetProjectsCountByRole} from '../hooks/useProjects';
import { useLastMeasurement } from '../hooks/useMeasurement';
import MeasurementChart from '../components/task/MeasurementChart';
import {
  KronosLayout,
  KronosPageHeader,
  KronosGrid,
  KronosSection,
  KronosCard,
  KronosButton,
  KronosSensorCard,
  KronosStatCard,
  KronosBadge,
} from '../components/kronos';
import {
  Activity,
  ChevronRight,
  Box,
  Download,
  Plus,
  RefreshCw,
  AlertTriangle,
  Users,
  Layers,
  Clock,
  MapPin,
  Radio,
  Cpu,
} from 'lucide-react';
import {useGetAllDevices} from "../hooks/useDevices.ts";
import { useDashboardStats, useRecentActivity } from '../hooks/useDashboardStats';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';


const sensors = [
  {
    id: 'SN-0042',
    name: 'Foundation Sensor A1',
    type: 'temperature' as const,
    status: 'online' as const,
    location: 'Tower A - Foundation',
    reading: { value: 24.5, unit: '°C', timestamp: '2 min ago' },
    trend: 'up' as const,
    trendValue: '+0.3°C',
    sparklineData: [22, 23, 22.5, 23.5, 24, 24.5, 24, 24.2, 24.5],
  },
  {
    id: 'SN-0087',
    name: 'Column Sensor B3',
    type: 'humidity' as const,
    status: 'warning' as const,
    location: 'Tower B - Level 3',
    reading: { value: 78, unit: '%', timestamp: '5 min ago' },
    trend: 'up' as const,
    trendValue: '+5%',
    sparklineData: [65, 68, 72, 75, 73, 76, 78],
  },
  {
    id: 'SN-0123',
    name: 'Slab Sensor C5',
    type: 'pressure' as const,
    status: 'online' as const,
    location: 'Tower A - Level 5',
    reading: { value: 1.02, unit: 'MPa', timestamp: '1 min ago' },
    trend: 'stable' as const,
    trendValue: 'Stable',
    sparklineData: [1.01, 1.02, 1.01, 1.02, 1.02, 1.02, 1.02],
  },
  {
    id: 'SN-0156',
    name: 'Beam Sensor D2',
    type: 'strain' as const,
    status: 'offline' as const,
    location: 'Tower C - Level 2',
    reading: { value: 0, unit: 'με', timestamp: 'Offline' },
    trend: 'down' as const,
    trendValue: 'No data',
    sparklineData: [],
  },
  {
    id: 'SN-0189',
    name: 'Foundation Sensor A2',
    type: 'temperature' as const,
    status: 'online' as const,
    location: 'Tower A - Foundation',
    reading: { value: 23.8, unit: '°C', timestamp: '1 min ago' },
    trend: 'stable' as const,
    trendValue: '+0.1°C',
    sparklineData: [23.5, 23.6, 23.7, 23.6, 23.8, 23.7, 23.8],
  },
  {
    id: 'SN-0201',
    name: 'Column Sensor B5',
    type: 'strain' as const,
    status: 'online' as const,
    location: 'Tower B - Level 5',
    reading: { value: 245, unit: 'με', timestamp: '3 min ago' },
    trend: 'up' as const,
    trendValue: '+12με',
    sparklineData: [220, 225, 230, 235, 240, 242, 245],
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'all' | number>('all');
  const { data: devices } = useGetAllDevices();

  const totalDeviceCount = devices?.length ?? 0;
  const onlineDeviceCount = devices?.filter((d) => d.status === 'online').length ?? 0;
  const uncheckedDeviceCount = devices?.filter((d) => d.status === 'unchecked').length ?? 0;
  const offlineDeviceCount = devices?.filter((d) => d.status === 'offline').length ?? 0;
  const archivedDeviceCount = devices?.filter((d) => d.status === 'archived').length ?? 0;
  const pct = (count: number) => (totalDeviceCount > 0 ? (count / totalDeviceCount) * 100 : 0);

  const totalDevices  = devices?.length ?? 0;

  const { data: projects, isLoading, isError, error } = useGetProjects();
  const { data: adminCount = 0 } = useGetProjectsCountByRole('admin');
  const { data: lastMeasurement, isLoading: lastMeasurementLoading } = useLastMeasurement();
  const { data: stats } = useDashboardStats();
  const { data: recentActivity = [], isLoading: recentActivityLoading } = useRecentActivity();

  const activeChannels = useMemo(() => {
    if (!lastMeasurement?.data) return [];
    const active: number[] = [];
    for (let ch = 1; ch <= 16; ch++) {
      if (lastMeasurement.data.some(p => p.g[ch - 1] !== 0 || p.b[ch - 1] !== 0)) {
        active.push(ch);
      }
    }
    return active;
  }, [lastMeasurement]);

  const visibleChannels = selectedChannel === 'all'
    ? Array.from({ length: 16 }, (_, i) => i + 1)
    : [selectedChannel as number];

  if (isLoading) return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
  );

  if (isError) return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-destructive">Error: {error?.message}</p>
      </div>
  );

  return (
      <KronosLayout title="Dashboard" subtitle="Concrete Monitoring System">
        <KronosPageHeader
            title="System Overview"
            description="Real-time sensor monitoring and analytics"
            actions={
              <>
                <KronosButton variant="outline" size="sm" leftIcon={<RefreshCw className="size-4" />}>
                  Refresh
                </KronosButton>
                <KronosButton variant="outline" size="sm" leftIcon={<Download className="size-4" />}>
                  Export
                </KronosButton>
                <KronosButton
                    size="sm"
                    leftIcon={<Plus className="size-4" />}
                    onClick={() => setShowCreateModal(true)}
                >
                  Nuevo Proyecto
                </KronosButton>
              </>
            }
        />

        {/* Stats */}
        <KronosSection className="mb-6">
          <KronosGrid columns={4}>
            <KronosStatCard
                label="Total Devices"
                value={stats?.totalDevices ?? totalDevices}
                trend={(stats?.newDevicesThisWeek ?? 0) > 0 ? 'up' : 'stable'}
                trendValue={`+${stats?.newDevicesThisWeek ?? 0}`}
                trendLabel="esta semana"
                icon={Activity}
                iconColor="primary"
            />
            <KronosStatCard
                label="Active Projects"
                value={stats?.activeProjects ?? adminCount}
                icon={Box}
                iconColor="success"
            />
            <KronosStatCard
                label="Alerts"
                value={stats?.pendingAlerts ?? 0}
                trendLabel="pendientes"
                icon={AlertTriangle}
                iconColor="warning"
            />
            <KronosStatCard
                label="Team Members"
                value={stats?.teamMembers ?? 0}
                icon={Users}
                iconColor="success"
            />
          </KronosGrid>
        </KronosSection>

        {/* ── Carrusel de Proyectos ── */}
        <KronosSection
          title="Projects"
          description="Click a project to view details"
          className="mb-6"
          actions={
            <KronosButton
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                rightIcon={<ChevronRight className="size-3.5" />}
                onClick={() => navigate('/projects')}
            >
              Ver todos los proyectos
            </KronosButton>
          }
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {projects?.slice(0, 3).map((project) => (
                  <div
                      key={project.uuid}
                      onClick={() => navigate(`/projects/${project.uuid}`)}
                      className="cursor-pointer"
                  >
                    <KronosCard className="hover:border-primary transition-colors min-h-[100px] h-full">
                      <h2 className="text-sm font-semibold text-foreground">{project.name}</h2>
                      <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                    </KronosCard>
                  </div>
              ))}

              {/* Card: Crear proyecto nuevo */}
              <div
                  onClick={() => setShowCreateModal(true)}
                  className="cursor-pointer group"
              >
                <KronosCard className="border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-2 min-h-[100px] h-full">
                  <span className="text-2xl text-muted-foreground/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300 ease-in-out select-none">+</span>
                  <p className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                    Crear proyecto nuevo
                  </p>
                </KronosCard>
              </div>
          </div>
        </KronosSection>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <KronosCard>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">Última Medición</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {lastMeasurement
                      ? [lastMeasurement.projectName, lastMeasurement.taskName].filter(Boolean).join(' · ')
                      : 'Sin datos'}
                    {lastMeasurement?.takenAt && (
                      <span>
                        {' · '}
                        {new Date(lastMeasurement.takenAt).toLocaleString('es-PE', {
                          day: '2-digit', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* Filtro de canales */}
                  {activeChannels.length > 0 && (
                    activeChannels.length <= 5 ? (
                      <div className="flex gap-1">
                        {activeChannels.map(ch => (
                          <button
                            key={ch}
                            onClick={() => setSelectedChannel(ch)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                              selectedChannel === ch
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            Canal {ch}
                          </button>
                        ))}
                        <button
                          onClick={() => setSelectedChannel('all')}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            selectedChannel === 'all'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          Todos
                        </button>
                      </div>
                    ) : (
                      <select
                        value={selectedChannel}
                        onChange={e =>
                          setSelectedChannel(e.target.value === 'all' ? 'all' : Number(e.target.value))
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="all">Todos los canales</option>
                        {activeChannels.map(ch => (
                          <option key={ch} value={ch}>Canal {ch}</option>
                        ))}
                      </select>
                    )
                  )}

                  {/* Ver todas → */}
                  {lastMeasurement?.projectId && lastMeasurement?.taskId && (
                    <button
                      onClick={() =>
                        navigate(`/projects/${lastMeasurement.projectId}/tasks/${lastMeasurement.taskId}`)
                      }
                      className="flex items-center gap-0.5 rounded-full px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      Ver todas
                      <ChevronRight className="size-3" />
                    </button>
                  )}
                </div>
              </div>

              {lastMeasurementLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                </div>
              ) : !lastMeasurement?.data ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-md bg-muted/20 text-muted-foreground">
                  <Radio className="size-8 opacity-30" />
                  <p className="text-sm">Sin mediciones recientes</p>
                </div>
              ) : (
                <MeasurementChart
                  measurementData={lastMeasurement}
                  visibleChannels={visibleChannels}
                  isLoading={false}
                />
              )}
            </KronosCard>

            <KronosSection title="Critical Sensors" description="Sensors requiring attention">
              <KronosGrid columns={3}>
                {sensors.slice(0, 6).map((sensor) => (
                    <KronosSensorCard key={sensor.id} {...sensor} />
                ))}
              </KronosGrid>
            </KronosSection>
          </div>

          <div className="space-y-6">
            <KronosCard>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Structures</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">3 Towers</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Coverage</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">42 Zones</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Uptime</span>
                  </div>
                  <span className="text-sm font-semibold text-green-500">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Team</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">8 Active</span>
                </div>
              </div>
            </KronosCard>

            <KronosCard>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
                <KronosButton
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => navigate('/activity')}
                >
                  View All
                </KronosButton>
              </div>
              <div className="space-y-3">
                {recentActivityLoading && (
                    <p className="text-xs text-muted-foreground">Cargando...</p>
                )}
                {!recentActivityLoading && recentActivity.length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin actividad reciente.</p>
                )}
                {recentActivity.map((item) => {
                  const [mainLine, deviceLine] = item.message.split('\n');
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div
                          className={`mt-1 size-2 shrink-0 rounded-full ${
                              item.type === 'MEASUREMENT_FAILED' ? 'bg-red-500'
                                  : item.type === 'MEASUREMENT_WARNING' ? 'bg-yellow-500'
                                      : 'bg-green-500'
                          }`}
                      />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs text-foreground">{mainLine}</p>
                        {deviceLine && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Cpu className="size-3 shrink-0" />
                              <span className="truncate">{deviceLine}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </KronosCard>

            <KronosCard>
              <h3 className="mb-4 text-sm font-semibold text-foreground">Sensor Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <KronosBadge variant="success" dot size="sm">Online</KronosBadge>
                  <span className="text-sm font-semibold text-foreground">{onlineDeviceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <KronosBadge variant="warning" dot size="sm">Unchecked</KronosBadge>
                  <span className="text-sm font-semibold text-foreground">{uncheckedDeviceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <KronosBadge variant="danger" dot size="sm">Offline</KronosBadge>
                  <span className="text-sm font-semibold text-foreground">{offlineDeviceCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <KronosBadge variant="default" dot size="sm">Archived</KronosBadge>
                  <span className="text-sm font-semibold text-foreground">{archivedDeviceCount}</span>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div className="flex h-full">
                  <div className="bg-green-500" style={{ width: `${pct(onlineDeviceCount)}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${pct(uncheckedDeviceCount)}%` }} />
                  <div className="bg-red-500" style={{ width: `${pct(offlineDeviceCount)}%` }} />
                  <div className="bg-muted-foreground" style={{ width: `${pct(archivedDeviceCount)}%` }} />
                </div>
              </div>
            </KronosCard>
          </div>
        </div>

        {showCreateModal && (
            <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </KronosLayout>
  );
};

export default DashboardPage;