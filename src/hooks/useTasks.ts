import { useQuery, useMutation } from '@tanstack/react-query';
import { getTasks, createTask, createTaskPreference, getProjectDevices, getScheduledJobs } from '../api/tasks.api';
import type { CreateTaskPreferenceDto, ScheduledJobResponse } from '../types/measurement.types';
import { keepPreviousData } from '@tanstack/react-query';
import type {CreateTaskDto} from "../types/task.types.ts";
import type {DeviceInfo} from "../types/device.types.ts";

export const useGetTasks = (projectId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['tasks', projectId, page],
    queryFn: () => getTasks(projectId, page, limit),
    enabled: !!projectId,
    placeholderData: keepPreviousData, // evita flash blanco al cambiar página
  });
};

export const useCreateTask = (projectId: string) => {
  return useMutation({
    mutationFn: (data: CreateTaskDto) => createTask(projectId, data),
  });
};

export const useCreateTaskPreference = (taskId: number) => {
  return useMutation({
    mutationFn: (data: CreateTaskPreferenceDto) => createTaskPreference(taskId, data),
  });
};

export const useGetProjectDevices = (projectId: string) => {
  return useQuery<DeviceInfo[]>({
    queryKey: ['projects', projectId, 'devices'],
    queryFn: () => getProjectDevices(projectId),
    enabled: !!projectId,
  });
};

export const useGetScheduledJobs = (params: { projectId?: string; from: string; to: string }) => {
  return useQuery<ScheduledJobResponse[]>({
    queryKey: ['scheduled-jobs', params],
    queryFn: () => getScheduledJobs(params),
    enabled: !!params.from && !!params.to,
  });
};
