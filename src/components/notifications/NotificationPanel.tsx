import { useNavigate } from 'react-router-dom';
import {
  Bell,
  UserCheck,
  UserX,
  Users,
  Activity,
  AlertTriangle,
  Box,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../types/notification.types';

const typeConfig: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  TEAM_APPROVED:        { icon: UserCheck,     color: 'text-green-400' },
  TEAM_REJECTED:        { icon: UserX,         color: 'text-red-400' },
  TEAM_JOIN_REQUEST:    { icon: Users,         color: 'text-blue-400' },
  MEASUREMENT_COMPLETE: { icon: Activity,      color: 'text-green-400' },
  MEASUREMENT_FAILED:   { icon: AlertTriangle, color: 'text-yellow-400' },
  PROJECT_ASSIGNED:     { icon: Box,           color: 'text-blue-400' },
  SYSTEM:               { icon: Info,          color: 'text-muted-foreground' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

function getActionLink(notif: AppNotification): string | null {
  const { type, data } = notif;
  switch (type) {
    case 'TEAM_APPROVED':
      return '/dashboard';
    case 'TEAM_REJECTED':
      return '/join-team';
    case 'TEAM_JOIN_REQUEST':
      return '/admin/team-requests';
    case 'MEASUREMENT_COMPLETE':
    case 'MEASUREMENT_FAILED':
      if (data?.projectId && data?.taskId) {
        return `/projects/${data.projectId}/tasks/${data.taskId}`;
      }
      return data?.projectId ? `/projects/${data.projectId}` : null;
    case 'PROJECT_ASSIGNED':
      return data?.projectId ? `/projects/${data.projectId}` : '/projects';
    default:
      return null;
  }
}

export default function NotificationPanel() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, isError, markRead, markAllRead } =
    useNotifications();

  const handleClick = (notif: AppNotification) => {
    if (!notif.read) {
      markRead.mutate(notif.id);
    }
    const link = getActionLink(notif);
    if (link) navigate(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider">Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              disabled={markAllRead.isPending}
              onClick={(e) => {
                e.preventDefault();
                markAllRead.mutate();
              }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              Cargando...
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
              No se pudieron cargar las notificaciones
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Bell className="size-6 opacity-30" />
              <p className="text-xs">No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = typeConfig[notif.type] ?? typeConfig.SYSTEM;
              const Icon = config.icon;
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40',
                    !notif.read && 'bg-primary/5'
                  )}
                >
                  <Icon className={cn('mt-0.5 size-4 shrink-0', config.color)} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-tight text-foreground">
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
