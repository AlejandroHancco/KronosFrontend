import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Cpu } from 'lucide-react';
import {
    KronosLayout,
    KronosPageHeader,
    KronosCard,
    KronosButton,
    KronosLoader,
} from '../components/kronos';
import { cn } from '../lib/utils';
import { useNotifications } from '../hooks/useNotifications';
import { typeConfig, timeAgo, getActionLink, splitMessage } from '../lib/notification-display';
import type { AppNotification } from '../types/notification.types';

type Filter = 'all' | 'unread';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<Filter>('all');
    const { notifications, unreadCount, isLoading, isError, markRead, markAllRead } = useNotifications();

    const visible = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

    const handleClick = (notif: AppNotification) => {
        if (!notif.read) {
            markRead.mutate(notif.id);
        }
        const link = getActionLink(notif);
        if (link) navigate(link);
    };

    return (
        <KronosLayout title="Notificaciones" subtitle="Toda tu actividad y la de tu equipo">
            <KronosPageHeader
                title="Notificaciones"
                description="Mediciones del equipo, solicitudes de equipo y otros eventos de la plataforma."
                actions={
                    unreadCount > 0 && (
                        <KronosButton
                            variant="outline"
                            size="sm"
                            disabled={markAllRead.isPending}
                            onClick={() => markAllRead.mutate()}
                        >
                            Marcar todas como leídas
                        </KronosButton>
                    )
                }
            />

            <div className="mb-4 flex items-center gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        filter === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50',
                    )}
                >
                    Todas ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={cn(
                        'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                        filter === 'unread' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50',
                    )}
                >
                    Sin leer ({unreadCount})
                </button>
            </div>

            <KronosCard className="p-0">
                {isLoading ? (
                    <KronosLoader />
                ) : isError ? (
                    <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                        No se pudieron cargar las notificaciones
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
                        <Bell className="size-8 opacity-30" />
                        <p className="text-sm">
                            {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {visible.map((notif) => {
                            const config = typeConfig[notif.type] ?? typeConfig.SYSTEM;
                            const Icon = config.icon;
                            const [mainLine, deviceLine] = splitMessage(notif.message);
                            return (
                                <button
                                    key={notif.id}
                                    onClick={() => handleClick(notif)}
                                    className={cn(
                                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40',
                                        !notif.read && 'bg-primary/5',
                                    )}
                                >
                                    <Icon className={cn('mt-0.5 size-4 shrink-0', config.color)} />
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                        <p className="text-sm font-medium leading-tight text-foreground">
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{mainLine}</p>
                                        {deviceLine && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Cpu className="size-3 shrink-0" />
                                                <span className="truncate">{deviceLine}</span>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-muted-foreground/70">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </KronosCard>
        </KronosLayout>
    );
};

export default NotificationsPage;
