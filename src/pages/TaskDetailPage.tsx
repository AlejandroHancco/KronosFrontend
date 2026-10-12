import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import {
    useGetTask,
    useMeasure,
    useGetMeasurements,
    useGetMeasurementDetail
} from '../hooks/useMeasurement';
import { useUpdateTaskPreference } from '../hooks/useTaskPreference';
import { useGetProject } from '../hooks/useProjects';
import SweepConfigCard, { type FrequencyRange, type SweepFormData } from '../components/task/SweepConfigCard';
import MeasurementChart from '../components/task/MeasurementChart';
import ChannelSelector from '../components/task/ChannelSelector';
import MeasurementHistory from '../components/task/MeasurementHistory';
import { getErrorMessage, type ApiErrorResponse } from '../types/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMeasurementSocket } from '../hooks/useMeasurementSocket';
import { useSocket } from '../hooks/useSocket';
import { useGetTaskChannels } from '../hooks/useChannels';
import ChannelConfigModal from '../components/task/ChannelConfigModal';
import type { TaskChannelInfo } from '../types/measurement.types';
import { useState } from 'react';

import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosBadge,
    KronosSection,
    KronosButton,
} from '../components/kronos';
import { ArrowLeft, Cpu, Layers } from 'lucide-react';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
    completed:   'success',
    pending:     'warning',
    in_progress: 'info',
    cancelled:   'danger',
};

const statusLabel: Record<string, string> = {
    completed:   'Completado',
    pending:     'Pendiente',
    in_progress: 'En Progreso',
    cancelled:   'Cancelado',
};

const TaskDetailPage = () => {
    const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
    const navigate = useNavigate();
    const taskIdNum = Number(taskId);
    const queryClient = useQueryClient();

    const [selectedChannels, setSelectedChannels] = useState<number[]>([1]);
    const [visibleChannels, setVisibleChannels] = useState<number[]>(
        Array.from({ length: 16 }, (_, i) => i + 1)
    );
    const [selectedMeasurementId, setSelectedMeasurementId] = useState<number | null>(null);
    const [jobId, setJobId] = useState<string | null>(null);
    const [selectedChannelForConfig, setSelectedChannelForConfig] = useState<TaskChannelInfo | null>(null);
    const [jobStatus, setJobStatus] = useState<'idle' | 'queued' | 'measuring'>('idle');
    const lastRangesRef = useRef<FrequencyRange[] | null>(null);

    const { socket } = useWebSocket();
    const measurementState = useMeasurementSocket(socket, jobId);
    const appSocket = useSocket();

    const { data: task, isLoading: taskLoading, error: taskError } = useGetTask(taskIdNum);
    const { data: project } = useGetProject(projectId!);
    const measure = useMeasure(taskIdNum);
    const updatePreference = useUpdateTaskPreference(taskIdNum);

    const effectiveSelectedId =
        measurementState.isCompleted && measure.data
            ? null
            : selectedMeasurementId;

    const { data: measurements } = useGetMeasurements(taskIdNum);
    const { data: measurementDetail } = useGetMeasurementDetail(effectiveSelectedId);
    const { data: taskChannels } = useGetTaskChannels(taskIdNum);

    const methods = useForm<SweepFormData>({
        defaultValues: {
            ranges: [{ order: 1, startFreq: 0, stopFreq: 0, points: 801, sweepType: 'LOG' }],
        },
    });
    const { control } = methods;

    useEffect(() => {
        if (measurementState.isCompleted && measure.data) {
            queryClient.invalidateQueries({ queryKey: ['measurements', taskIdNum] });
        }
    }, [measurementState.isCompleted, measure.data, queryClient, taskIdNum]);

    // Sincronizar el estado del job con los eventos del socket de mediciones
    useEffect(() => {
        if (measurementState.isCompleted || measurementState.error) {
            setJobStatus('idle');
        } else if (measurementState.progress > 0) {
            setJobStatus('measuring');
        }
    }, [measurementState.isCompleted, measurementState.error, measurementState.progress]);

    // Eventos en tiempo real de la tarea (socket global)
    useEffect(() => {
        if (!taskIdNum) return;

        appSocket.emit('join-task', taskIdNum);

        const handleJobStarted = () => {
            setJobStatus('measuring');
        };

        const handleComplete = () => {
            queryClient.invalidateQueries({ queryKey: ['measurements', taskIdNum] });
            queryClient.invalidateQueries({ queryKey: ['last-measurement'] });
            setJobStatus('idle');
            toast.success('Medición completada');
        };

        const handleFailed = (data: { reason?: string }) => {
            setJobStatus('idle');
            toast.error(`La medición falló: ${data?.reason ?? 'error desconocido'}`, {
                action: lastRangesRef.current
                    ? { label: 'Reintentar', onClick: () => handleSweepSubmit(lastRangesRef.current!) }
                    : undefined,
            });
        };

        appSocket.on('job:started', handleJobStarted);
        appSocket.on('measurement:complete', handleComplete);
        appSocket.on('measurement:failed', handleFailed);

        return () => {
            appSocket.emit('leave-task', taskIdNum);
            appSocket.off('job:started', handleJobStarted);
            appSocket.off('measurement:complete', handleComplete);
            appSocket.off('measurement:failed', handleFailed);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskIdNum, appSocket, queryClient]);

    /** Valida los rangos antes de medir/guardar. Devuelve el mensaje de error o null si todo bien. */
    const validateRanges = (ranges: FrequencyRange[]): string | null => {
        for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            const label = ranges.length > 1 ? `Rango ${i + 1}: ` : '';
            if (!r.startFreq || r.startFreq <= 0) return `${label}Start Freq debe ser mayor que 0`;
            if (!r.stopFreq || r.stopFreq <= 0) return `${label}Stop Freq debe ser mayor que 0`;
            if (r.startFreq >= r.stopFreq) return `${label}Start Freq debe ser menor que Stop Freq`;
        }
        return null;
    };

    const handleSweepSubmit = (ranges: FrequencyRange[]) => {
        if (selectedChannels.length === 0) {
            toast.error('Debes seleccionar al menos un canal para realizar la medición');
            return;
        }
        if (!hasDevicesAssigned) {
            toast.error('Esta tarea no tiene un analizador y un MUX asignados. Configúralos antes de medir.');
            return;
        }
        const rangeError = validateRanges(ranges);
        if (rangeError) {
            toast.error(rangeError);
            return;
        }

        lastRangesRef.current = ranges;
        const newJobId = `${taskIdNum}-${Date.now()}`;
        setJobId(newJobId);
        setJobStatus('queued');
        measure.mutate({
            ranges: ranges.map((r) => ({
                startFreq: r.startFreq,
                stopFreq:  r.stopFreq,
                points:    r.points,
                sweepType: r.sweepType,
            })),
            selectedChannels,
            jobId: newJobId,
        }, {
            onError: (err) => {
                setJobStatus('idle');
                const message = getErrorMessage((err as AxiosError<ApiErrorResponse>).response?.data);
                toast.error(`No se pudo iniciar la medición: ${message}`, {
                    action: { label: 'Reintentar', onClick: () => handleSweepSubmit(ranges) },
                });
            },
        });
    };

    const handleSaveRanges = (ranges: FrequencyRange[]) => {
        if (!hasDevicesAssigned) {
            toast.error('Esta tarea no tiene un analizador y un MUX asignados. Asígnalos antes de guardar un preset.');
            return;
        }
        const rangeError = validateRanges(ranges);
        if (rangeError) {
            toast.error(rangeError);
            return;
        }

        updatePreference.mutate({
            ranges: ranges.map((r, i) => ({
                order: i + 1,
                startFreq: r.startFreq,
                stopFreq:  r.stopFreq,
                points:    r.points,
                sweepType: r.sweepType,
            })),
        }, {
            onSuccess: () => {
                toast.success('Preset guardado');
            },
            onError: (err) => {
                const message = getErrorMessage((err as AxiosError<ApiErrorResponse>).response?.data);
                toast.error(`No se pudo guardar el preset: ${message}`);
            },
        });
    };

    const handleChannelToggle = (channel: number) => {
        setSelectedChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    const handleToggleVisible = (channel: number) => {
        setVisibleChannels(prev =>
            prev.includes(channel)
                ? prev.filter(c => c !== channel)
                : [...prev, channel]
        );
    };

    // ── Early returns ──────────────────────────────────────────────────────────
    if (taskLoading) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
    );

    if (taskError) {
        const status = taskError instanceof AxiosError ? taskError.response?.status : undefined;
        if (status === 404) return <Navigate to="/404" replace />;
        if (status === 403) return <Navigate to="/403" replace />;
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <p className="text-destructive">
                    {status && status >= 500
                        ? 'Error del servidor, intenta de nuevo'
                        : `Error: ${taskError.message}`}
                </p>
            </div>
        );
    }

    if (!task) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Tarea no encontrada.</p>
        </div>
    );

    const analyzerDevice = task.activePreference?.analyzerDevice;
    const muxDevice      = task.activePreference?.muxDevice;
    const hasDevicesAssigned = !!analyzerDevice && !!muxDevice;
    const activePreferenceRanges = task.activePreference?.ranges ?? [];
    const firstActiveRange = activePreferenceRanges[0];

    // Job activo = en cola, midiendo, o con progreso pendiente en el socket de mediciones
    const isJobActive =
        measure.isPending ||
        jobStatus !== 'idle' ||
        (measurementState.progress > 0 && !measurementState.isCompleted && !measurementState.error);

    const jobStatusMessage =
        measurementState.statusMessage
            ? measurementState.statusMessage
            : jobStatus === 'queued'
                ? 'En cola...'
                : jobStatus === 'measuring'
                    ? 'Midiendo...'
                    : '';

    return (
        <KronosLayout title={task.name} subtitle={project?.name ?? 'Proyecto'}>
            <div className="flex flex-col">

                {/* FILA 1 — Header */}
                <div>
                    <KronosPageHeader
                        title={task.name}
                        description={project?.name}
                        actions={
                            <>
                                <KronosButton
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<ArrowLeft className="size-4" />}
                                    onClick={() => navigate(`/projects/${projectId}`)}
                                >
                                    Volver
                                </KronosButton>
                                <KronosBadge variant={statusVariant[task.status] ?? 'default'} dot size="sm">
                                    {statusLabel[task.status] ?? task.status}
                                </KronosBadge>
                            </>
                        }
                    />
                </div>

                {/* FILA 2 — Contenido principal */}
                <div className="flex gap-4 mt-6">

                    {/* Columna izquierda — Gráfico 60% */}
                    <div className="w-[60%]">
                        <KronosCard>
                            <MeasurementChart
                                measurementData={
                                    measurementState.completedData && measure.data
                                        ? {
                                            id:           measure.data.measurementId,
                                            takenAt:      measure.data.takenAt,
                                            startFreq:    measure.data.totalPoints > 0 ? (firstActiveRange?.startFreq || 0) : 0,
                                            stopFreq:     measure.data.totalPoints > 0 ? (firstActiveRange?.stopFreq  || 0) : 0,
                                            sweepType:    measure.data.sweepType,
                                            analyzerName: task.activePreference?.analyzerDevice?.name || 'Analyzer',
                                            muxName:      task.activePreference?.muxDevice?.name      || 'MUX',
                                            data:         measurementState.completedData,
                                        }
                                        : (measurementDetail ?? measure.data)
                                }
                                visibleChannels={visibleChannels}
                                isLoading={
                                    effectiveSelectedId !== null &&
                                    measurementDetail?.id !== effectiveSelectedId
                                }
                            />
                        </KronosCard>
                    </div>

                    {/* Columna derecha — Canales + Sweep + Dispositivos 40% */}
                    <div className="w-[40%] overflow-y-auto flex flex-col gap-4">

                        {/* 1. Canales */}
                        <KronosSection title="Canales" description="Selecciona los canales para la medición">
                            <ChannelSelector
                                taskId={taskIdNum}
                                taskChannels={taskChannels || []}
                                selectedChannels={selectedChannels}
                                onChannelToggle={handleChannelToggle}
                                visibleChannels={visibleChannels}
                                onToggleVisible={handleToggleVisible}
                                onChannelClick={setSelectedChannelForConfig}
                            />
                        </KronosSection>

                        <div className="border-b border-slate-700" />

                        {/* 2. Sweep Configuration */}
                        <FormProvider {...methods}>
                            <SweepConfigCard
                                control={control}
                                onSubmit={handleSweepSubmit}
                                onSave={handleSaveRanges}
                                isSaving={updatePreference.isPending}
                                isMeasuring={isJobActive}
                                measureData={measure.data}
                                measureError={measure.error}
                                progress={measurementState.progress}
                                currentChannel={measurementState.currentChannel}
                                statusMessage={jobStatusMessage}
                                isCompleted={measurementState.isCompleted}
                                taskId={taskIdNum}
                                selectedChannels={selectedChannels}
                                taskChannels={taskChannels || []}
                                preferenceRanges={
                                    activePreferenceRanges.length > 0
                                        ? activePreferenceRanges.map((r) => ({
                                            order: r.order,
                                            startFreq: r.startFreq,
                                            stopFreq: r.stopFreq,
                                            points: r.points ?? 801,
                                            sweepType: r.sweepType ?? 'LIN',
                                          }))
                                        : undefined
                                }
                            />
                        </FormProvider>

                        <div className="border-b border-slate-700" />

                        {/* 3. Dispositivos activos */}
                        <div className="grid grid-cols-2 gap-3">
                            <KronosCard className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                    <Cpu className="size-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Analizador activo</p>
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {analyzerDevice?.name ?? 'Sin asignar'}
                                    </p>
                                    <p className="text-xs font-mono text-muted-foreground">
                                        {analyzerDevice?.ip ?? '—'}
                                    </p>
                                </div>
                                {analyzerDevice && (
                                    <div className="ml-auto size-2 shrink-0 rounded-full bg-green-500" />
                                )}
                            </KronosCard>

                            <KronosCard className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                    <Layers className="size-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">MUX activo</p>
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {muxDevice?.name ?? 'Sin asignar'}
                                    </p>
                                    <p className="text-xs font-mono text-muted-foreground">
                                        {muxDevice?.ip ?? '—'}
                                    </p>
                                </div>
                                {muxDevice && (
                                    <div className="ml-auto size-2 shrink-0 rounded-full bg-green-500" />
                                )}
                            </KronosCard>
                        </div>

                    </div>
                </div>

                {/* FILA 3 — Historial de mediciones (ancho completo) */}
                <div className="mt-4">
                    <MeasurementHistory
                        measurements={measurements || []}
                        onSelectMeasurement={setSelectedMeasurementId}
                        selectedId={effectiveSelectedId}
                    />
                </div>

            </div>

            <ChannelConfigModal
                taskId={taskIdNum}
                channel={selectedChannelForConfig}
                onClose={() => setSelectedChannelForConfig(null)}
            />
        </KronosLayout>
    );
};

export default TaskDetailPage;