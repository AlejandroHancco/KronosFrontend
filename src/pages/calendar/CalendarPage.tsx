import { useState, useMemo } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    subWeeks,
    addWeeks,
    addMinutes,
    isSameDay,
    parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosButton,
} from '../../components/kronos';
import { useGetProjects } from '../../hooks/useProjects';
import { useGetScheduledJobs } from '../../hooks/useTasks';
import type { ScheduledJobStatus } from '../../types/measurement.types';

const HOUR_HEIGHT = 48;

const getStatusColor = (status: ScheduledJobStatus) => {
    switch (status) {
        case 'pending': return 'bg-primary/20 border-primary';
        case 'running': return 'bg-green-500/20 border-green-500';
        case 'completed': return 'bg-green-700/20 border-green-700';
        case 'failed': return 'bg-destructive/20 border-destructive';
        case 'cancelled': return 'bg-muted border-border';
        default: return 'bg-muted border-border';
    }
};

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [projectFilter, setProjectFilter] = useState('all');

    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]); // Empieza en lunes
    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
    const days = useMemo(() => Array.from({ length: 7 }, (_item, i) => addDays(weekStart, i)), [weekStart]);

    const { data: projects = [] } = useGetProjects();
    const { data: jobs = [] } = useGetScheduledJobs({
        projectId: projectFilter === 'all' ? undefined : projectFilter,
        from: weekStart.toISOString(),
        to: weekEnd.toISOString(),
    });

    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const goToday = () => setCurrentDate(new Date());

    // Agrupar por analizador y calcular bloques
    const jobsByAnalyzer = useMemo(() => {
        type CalendarBlock = (typeof jobs)[number] & {
            blockStart: Date;
            blockEnd: Date;
            index: number;
        };
        const groups: Record<string, { name: string; ip: string; jobs: CalendarBlock[] }> = {};

        jobs.forEach(job => {
            const analyzer = job.task.activePreference?.analyzerDevice;
            const key = analyzer ? `${analyzer.name}-${analyzer.ip}` : 'Sin Analizador';
            
            if (!groups[key]) {
                groups[key] = {
                    name: analyzer?.name ?? 'Sin Analizador',
                    ip: analyzer?.ip ?? '-',
                    jobs: []
                };
            }

            const startAt = parseISO(job.startAt);
            const interval = job.intervalMinutes ?? 0;

            Array.from({ length: job.repeatCount }, (_item, i) => {
                const blockStart = addMinutes(startAt, i * interval);
                const blockEnd = addMinutes(blockStart, 10);
                
                // Solo añadir si cae en la semana actual (simplificado, ya filtramos por API pero por si acaso hay repeticiones largas)
                if (blockStart >= weekStart && blockStart <= addDays(weekEnd, 1)) {
                   groups[key].jobs.push({
                        ...job,
                        blockStart,
                        blockEnd,
                        index: i + 1,
                    });
                }
            });
        });

        return Object.entries(groups).filter(([, group]) => group.jobs.length > 0);
    }, [jobs, weekStart, weekEnd]);

    return (
        <KronosLayout>
            <KronosPageHeader
                title="Calendario"
                description="Mediciones programadas"
            />

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between bg-card p-2 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <KronosButton variant="ghost" size="icon" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </KronosButton>
                        <span className="text-sm font-medium min-w-[180px] text-center">
                            {format(weekStart, 'd MMM', { locale: es })} — {format(weekEnd, 'd MMM yyyy', { locale: es })}
                        </span>
                        <KronosButton variant="ghost" size="icon" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </KronosButton>
                        <KronosButton variant="outline" size="sm" onClick={goToday}>
                            Hoy
                        </KronosButton>
                    </div>

                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="bg-background border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">Todos los proyectos</option>
                        {projects.map(p => (
                            <option key={p.uuid} value={p.uuid}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <KronosCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px] flex flex-col max-h-[700px]">
                            {/* Header de días - Fijo arriba */}
                            <div className="flex border-b border-border bg-muted/30 sticky top-0 z-20">
                                <div className="w-16 border-r border-border flex-shrink-0 bg-muted/30" />
                                <div className="flex-1 grid grid-cols-7 border-r border-border">
                                    {days.map(day => (
                                        <div key={day.toString()} className="p-2 text-center border-r border-border last:border-r-0">
                                            <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE', { locale: es })}</div>
                                            <div className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-primary' : ''}`}>
                                                {format(day, 'd')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Espacio reservado para el scrollbar para mantener alineación */}
                                <div className="w-[15px] bg-muted/30" />
                            </div>

                            {/* Cuerpo del calendario — scrollable */}
                            <div className="relative flex flex-1 overflow-y-scroll">
                                {/* Columna de horas */}
                                <div className="w-16 flex-shrink-0 bg-muted/10 border-r border-border sticky left-0 z-10">
                                    {Array.from({ length: 24 }, (_item, i) => (
                                        <div
                                            key={i}
                                            style={{ height: '48px' }}
                                            className="flex items-start justify-end pr-2 pt-1 border-b border-border/40 last:border-b-0"
                                        >
                                            <span className="text-[11px] text-muted-foreground">
                                                {String(i).padStart(2, '0')}:00
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* 7 columnas de días */}
                                <div className="flex-1 grid grid-cols-7">
                                    {days.map((day) => (
                                        <div key={day.toISOString()} className="relative border-r border-border last:border-r-0">
                                            {Array.from({ length: 24 }, (_item, i) => (
                                                <div
                                                    key={i}
                                                    style={{ height: '48px' }}
                                                    className="border-b border-border/40 last:border-b-0"
                                                />
                                            ))}

                                            {/* Bloques de trabajos posicionados absolutamente */}
                                            {jobsByAnalyzer.flatMap(([, group]) => 
                                                group.jobs
                                                    .filter(job => isSameDay(job.blockStart, day))
                                                    .map((job) => {
                                                        const startTotalMinutes = job.blockStart.getHours() * 60 + job.blockStart.getMinutes();
                                                        const calendarStartMinutes = 0; // El calendario empieza a las 00:00
                                                        const top = (startTotalMinutes - calendarStartMinutes) * (HOUR_HEIGHT / 60);
                                                        const height = 10 * (HOUR_HEIGHT / 60);

                                                        if (top < 0 || top >= 24 * HOUR_HEIGHT) return null;

                                                        return (
                                                            <div
                                                                key={`${job.id}-${job.index}`}
                                                                className={`absolute left-1 right-1 rounded-sm border-l-2 p-1 text-[9px] leading-tight overflow-hidden group cursor-pointer transition-all hover:z-20 ${getStatusColor(job.status)}`}
                                                                style={{ top: `${top}px`, height: `${height}px` }}
                                                                title={`${job.label || job.task.name}\n${format(job.blockStart, 'HH:mm')} - ${format(job.blockEnd, 'HH:mm')}\nCanales: ${job.channelNumbers.join(',')}\nRep: ${job.index}/${job.repeatCount}\nEstado: ${job.status}`}
                                                            >
                                                                <div className="truncate font-bold">{job.label || job.task.name}</div>
                                                                <div className="truncate opacity-80">
                                                                    rep {job.index}/{job.repeatCount} · ch {job.channelNumbers.join(',')}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Secciones por analizador (opcional/adicional si se requiere mantener el label separador) */}
                            {jobsByAnalyzer.length > 0 && (
                                <div className="bg-muted/30 p-2 text-[10px] font-bold border-t border-border sticky bottom-0 z-20">
                                    DISPOSITIVOS ACTIVOS: {jobsByAnalyzer.map(([, g]) => g.name).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </KronosCard>
            </div>
        </KronosLayout>
    );
};

export default CalendarPage;
