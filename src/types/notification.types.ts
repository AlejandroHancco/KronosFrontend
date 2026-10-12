export type NotificationType =
  | 'TEAM_APPROVED'
  | 'TEAM_REJECTED'
  | 'TEAM_JOIN_REQUEST'
  | 'MEASUREMENT_COMPLETE'
  | 'MEASUREMENT_FAILED'
  | 'PROJECT_ASSIGNED'
  | 'SYSTEM';

export interface AppNotification {
  id: number | string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  /** Datos opcionales para construir el link de acción */
  data?: {
    teamId?: string;
    projectId?: string;
    taskId?: number | string;
    [key: string]: unknown;
  };
}
