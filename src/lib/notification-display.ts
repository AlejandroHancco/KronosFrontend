import {
  UserCheck,
  UserX,
  Users,
  Activity,
  AlertTriangle,
  Box,
  Info,
  type LucideIcon,
} from 'lucide-react';
import type { AppNotification, NotificationType } from '../types/notification.types';

export const typeConfig: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  TEAM_APPROVED:        { icon: UserCheck,     color: 'text-green-400' },
  TEAM_REJECTED:        { icon: UserX,         color: 'text-red-400' },
  TEAM_JOIN_REQUEST:    { icon: Users,         color: 'text-blue-400' },
  MEASUREMENT_COMPLETE: { icon: Activity,      color: 'text-green-400' },
  MEASUREMENT_WARNING:  { icon: AlertTriangle, color: 'text-yellow-400' },
  MEASUREMENT_FAILED:   { icon: AlertTriangle, color: 'text-red-400' },
  PROJECT_ASSIGNED:     { icon: Box,           color: 'text-blue-400' },
  SYSTEM:               { icon: Info,          color: 'text-muted-foreground' },
};

/** Para el log de actividad (vista de tabla): etiqueta corta + variante de KronosBadge. */
export const typeBadge: Record<NotificationType, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  TEAM_APPROVED:        { label: 'Aprobación', variant: 'success' },
  TEAM_REJECTED:        { label: 'Rechazo',    variant: 'danger' },
  TEAM_JOIN_REQUEST:    { label: 'Solicitud',  variant: 'info' },
  MEASUREMENT_COMPLETE: { label: 'Medición',   variant: 'success' },
  MEASUREMENT_WARNING:  { label: 'Advertencia', variant: 'warning' },
  MEASUREMENT_FAILED:   { label: 'Error',      variant: 'danger' },
  PROJECT_ASSIGNED:     { label: 'Proyecto',   variant: 'info' },
  SYSTEM:               { label: 'Sistema',    variant: 'default' },
};

export function timeAgo(dateStr: string): string {
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

export function getActionLink(notif: AppNotification): string | null {
  const { type, data } = notif;
  switch (type) {
    case 'TEAM_APPROVED':
      return '/dashboard';
    case 'TEAM_REJECTED':
      return '/join-team';
    case 'TEAM_JOIN_REQUEST':
      return '/admin/team-requests';
    case 'MEASUREMENT_COMPLETE':
    case 'MEASUREMENT_WARNING':
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

/** Mensaje partido en línea principal + línea de dispositivos (ver notifications.service.ts en backend). */
export function splitMessage(message: string): [string, string | undefined] {
  const [mainLine, deviceLine] = message.split('\n');
  return [mainLine, deviceLine];
}
