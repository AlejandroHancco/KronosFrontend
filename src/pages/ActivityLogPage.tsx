import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosButton,
    KronosBadge,
    KronosTable,
    KronosLoader,
    type KronosColumn,
} from '../components/kronos';
import { cn } from '../lib/utils';
import { useActivityLog, type ActivityLogItem } from '../hooks/useDashboardStats';
import { typeBadge, splitMessage } from '../lib/notification-display';
import type { NotificationType } from '../types/notification.types';

const PAGE_SIZE = 20;

const FILTERS: { label: string; value: NotificationType | 'all' }[] = [
    { label: 'Todo', value: 'all' },
    { label: 'Mediciones correctas', value: 'MEASUREMENT_COMPLETE' },
    { label: 'Advertencias', value: 'MEASUREMENT_WARNING' },
    { label: 'Errores', value: 'MEASUREMENT_FAILED' },
    { label: 'Equipo', value: 'TEAM_JOIN_REQUEST' },
    { label: 'Aprobaciones', value: 'TEAM_APPROVED' },
    { label: 'Rechazos', value: 'TEAM_REJECTED' },
];

const ActivityLogPage = () => {
    const [type, setType] = useState<NotificationType | 'all'>('all');
    const [page, setPage] = useState(0);

    const { data, isLoading } = useActivityLog({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        type: type === 'all' ? undefined : type,
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const handleFilterChange = (value: NotificationType | 'all') => {
        setType(value);
        setPage(0);
    };

    const columns: KronosColumn<ActivityLogItem>[] = [
        {
            key: 'createdAt',
            header: 'Fecha',
            width: '160px',
            render: (value) =>
                new Date(value as string).toLocaleString('es-PE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
        },
        {
            key: 'type',
            header: 'Tipo',
            width: '140px',
            render: (value) => {
                const badge = typeBadge[value as NotificationType] ?? typeBadge.SYSTEM;
                return <KronosBadge variant={badge.variant} size="sm">{badge.label}</KronosBadge>;
            },
        },
        { key: 'title', header: 'Evento' },
        {
            key: 'message',
            header: 'Detalle',
            render: (value) => {
                const [mainLine, deviceLine] = splitMessage(value as string);
                return (
                    <div className="space-y-0.5">
                        <p className="text-sm text-foreground">{mainLine}</p>
                        {deviceLine && (
                            <p className="text-xs text-muted-foreground">{deviceLine}</p>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <KronosLayout title="Actividad" subtitle="Log de eventos del equipo">
            <KronosPageHeader
                title="Actividad"
                description="Registro de auditoría de todo lo que ha pasado en el equipo: mediciones, solicitudes y cambios de membresía. Para tus avisos personales, ve a Notificaciones."
            />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => handleFilterChange(f.value)}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                            type === f.value
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted/50',
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <KronosCard className="p-0">
                {isLoading ? (
                    <KronosLoader className="py-16" />
                ) : (
                    <KronosTable
                        columns={columns}
                        data={items}
                        emptyMessage="No hay actividad registrada"
                        className="border-0"
                    />
                )}
            </KronosCard>

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        Página {page + 1} de {totalPages} · {total} eventos
                    </span>
                    <div className="flex items-center gap-2">
                        <KronosButton
                            variant="outline"
                            size="sm"
                            disabled={page === 0}
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                            <ChevronLeft className="size-4" />
                        </KronosButton>
                        <KronosButton
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        >
                            <ChevronRight className="size-4" />
                        </KronosButton>
                    </div>
                </div>
            )}
        </KronosLayout>
    );
};

export default ActivityLogPage;
