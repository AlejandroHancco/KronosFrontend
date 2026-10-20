import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ReportRange, ReportTaskRow, TaskReportData } from '../types/report.types';

export const useReportTasks = (projectId?: string) =>
  useQuery<ReportTaskRow[]>({
    queryKey: ['reports', 'tasks', projectId ?? 'all'],
    queryFn: async () => (await apiClient.get('/reports/tasks', { params: { projectId } })).data,
  });

export const fetchTaskReport = async (taskId: number, range: ReportRange): Promise<TaskReportData> =>
  (await apiClient.get(`/reports/task/${taskId}`, { params: range })).data;
