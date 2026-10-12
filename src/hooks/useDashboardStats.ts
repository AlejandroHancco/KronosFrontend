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
