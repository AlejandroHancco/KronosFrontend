import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetTask,
    useMeasure,
    useGetMeasurements,
    useGetMeasurementDetail
} from '../hooks/useMeasurement';
import { useGetProject } from '../hooks/useProjects';
import SweepConfigCard, { type FrequencyRange, type SweepFormData } from '../components/task/SweepConfigCard';
import MeasurementChart from '../components/task/MeasurementChart';
import ChannelSelector from '../components/task/ChannelSelector';
import MeasurementHistory from '../components/task/MeasurementHistory';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMeasurementSocket } from '../hooks/useMeasurementSocket';
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

    const { socket } = useWebSocket();
    const measurementState = useMeasurementSocket(socket, jobId);

    const { data: task, isLoading: taskLoading, error: taskError } = useGetTask(taskIdNum);
    const { data: project } = useGetProject(projectId!);
    const measure = useMeasure(taskIdNum);

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
        if (task?.activePreference) {
            methods.reset({
                ranges: [{
                    order: 1,
                    startFreq: Number(task.activePreference.startFreq) || 0,
                    stopFreq:  Number(task.activePreference.stopFreq)  || 0,
                    points:    Number(task.activePreference.points)    || 801,
                    sweepType: task.activePreference.sweepType         || 'LIN',
                }]
            });
        }
    }, [task, methods]);

    useEffect(() => {
        if (measurementState.isCompleted && measure.data) {
            queryClient.invalidateQueries({ queryKey: ['measurements', taskIdNum] });
        }
    }, [measurementState.isCompleted, measure.data, queryClient, taskIdNum]);

    const handleSweepSubmit = (range: FrequencyRange) => {
        if (selectedChannels.length === 0) {
            alert('Debes seleccionar al menos un canal para realizar la medición');
            return;
        }
        const newJobId = `${taskIdNum}-${Date.now()}`;
        setJobId(newJobId);
        measure.mutate({
            startFreq: range.startFreq,
            stopFreq:  range.stopFreq,
            points:    range.points,
            sweepType: range.sweepType,
            selectedChannels,
            jobId: newJobId,
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

    if (taskError) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-destructive">Error: {taskError.message}</p>
        </div>
    );

    if (!task) return (
        <div className="flex h-screen items-center justify-center bg-background">
            <p className="text-muted-foreground">Tarea no encontrada.</p>
        </div>
    );

    const analyzerDevice = task.activePreference?.analyzerDevice;
    const muxDevice      = task.activePreference?.muxDevice;

    return (
        <KronosLayout title={task.name} subtitle={project?.name ?? 'Proyecto'}>

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

            {/* Dispositivos activos */}
            <div className="mb-6 grid grid-cols-2 gap-4">
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

            {/* Cuerpo principal */}
            <div className="grid gap-6 lg:grid-cols-5">

                <div className="space-y-6 lg:col-span-2">
                    <FormProvider {...methods}>
                        <SweepConfigCard
                            control={control}
                            onSubmit={handleSweepSubmit}
                            isMeasuring={measure.isPending || measurementState.progress > 0}
                            measureData={measure.data}
                            measureError={measure.error}
                            progress={measurementState.progress}
                            currentChannel={measurementState.currentChannel}
                            statusMessage={measurementState.statusMessage}
                            isCompleted={measurementState.isCompleted}
                            taskId={taskIdNum}
                            selectedChannels={selectedChannels}
                            taskChannels={taskChannels || []}
                        />
                    </FormProvider>

                    <MeasurementHistory
                        measurements={measurements || []}
                        onSelectMeasurement={setSelectedMeasurementId}
                        selectedId={effectiveSelectedId}
                    />
                </div>

                <div className="lg:col-span-3 space-y-6">
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

                    <KronosSection title="Gráfico" description="Resultado de la medición">
                        <KronosCard className="p-0 overflow-hidden">
                            <MeasurementChart
                                measurementData={
                                    measurementState.completedData && measure.data
                                        ? {
                                            id:           measure.data.measurementId,
                                            takenAt:      measure.data.takenAt,
                                            startFreq:    measure.data.totalPoints > 0 ? (task.activePreference?.startFreq || 0) : 0,
                                            stopFreq:     measure.data.totalPoints > 0 ? (task.activePreference?.stopFreq  || 0) : 0,
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
                    </KronosSection>
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