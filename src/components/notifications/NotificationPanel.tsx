import { useNavigate } from 'react-router-dom';
import { Bell, Cpu } from 'lucide-react';
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
import { typeConfig, timeAgo, getActionLink, splitMessage } from '../../lib/notification-display';
import type { AppNotification } from '../../types/notification.types';

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
              const [mainLine, deviceLine] = splitMessage(notif.message);
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
                    <p className="truncate text-xs text-muted-foreground">{mainLine}</p>
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
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <button
          onClick={() => navigate('/notifications')}
          className="w-full px-3 py-2 text-center text-xs font-medium text-primary hover:underline"
        >
          Ver todas las notificaciones
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
