import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface DashboardStats {
  totalDevices: number;
  activeProjects: number;
  teamMembers: number;
  newDevicesThisWeek: number;
  pendingAlerts?: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get('/dashboard/stats').then((r) => r.data),
    refetchInterval: 60000,
    retry: 1,
  });
};

export interface RecentActivityItem {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

export const useRecentActivity = () => {
  return useQuery<RecentActivityItem[]>({
    queryKey: ['dashboard-recent-activity'],
    queryFn: () => apiClient.get('/dashboard/recent-activity').then((r) => r.data),
    refetchInterval: 60000,
    retry: 1,
  });
};

export interface ActivityLogItem {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface ActivityLogResult {
  items: ActivityLogItem[];
  total: number;
}

export const useActivityLog = (options: { limit: number; offset: number; type?: string }) => {
  const { limit, offset, type } = options;
  return useQuery<ActivityLogResult>({
    queryKey: ['dashboard-activity-log', limit, offset, type],
    queryFn: () =>
      apiClient
        .get('/dashboard/activity-log', { params: { limit, offset, type } })
        .then((r) => r.data),
    refetchInterval: 30000,
    retry: 1,
  });
};
