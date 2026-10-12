import apiClient from './client';
import type { AppNotification } from '../types/notification.types';

export const getNotifications = async (): Promise<AppNotification[]> => {
  const response = await apiClient.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id: number | string): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
