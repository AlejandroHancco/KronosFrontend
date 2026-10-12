import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../api/notifications.api';
import type { AppNotification } from '../types/notification.types';
import { useSocket } from './useSocket';

/**
 * Listener global de notificaciones en tiempo real.
 * Montar UNA sola vez (en PrivateLayout) para no duplicar toasts.
 */
export const useNotificationListener = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const handleNotification = (notif: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (notif?.title) {
        toast.info(notif.title, { description: notif.message });
      }
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, queryClient]);
};

/**
 * Lista de notificaciones + acciones. Seguro de usar en varios
 * componentes a la vez: React Query dedupe por queryKey.
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60000, // fallback por si el WebSocket falla
    retry: 1,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    markRead,
    markAllRead,
  };
};
