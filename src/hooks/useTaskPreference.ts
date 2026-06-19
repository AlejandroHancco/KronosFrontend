import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  getTaskPreference,
  createTaskPreference,
  updateTaskPreference,
  createScheduledJob,
} from '../api/tasks.api';
import type {
  CreateTaskPreferenceDto,
  UpdateTaskPreferenceDto,
  TestConnectionResponse,
  CreateScheduledJobDto,
} from '../types/measurement.types';

export const useGetTaskPreference = (taskId: number) => {
  return useQuery({
    queryKey: ['taskPreference', taskId],
    queryFn: () => getTaskPreference(taskId),
    enabled: !!taskId,
  });
};

export const useCreateTaskPreference = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskPreferenceDto) => createTaskPreference(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskPreference', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
  });
};

export const useUpdateTaskPreference = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskPreferenceDto) => updateTaskPreference(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskPreference', taskId] });
    },
  });
};

export const useTestConnection = () => {
  return useMutation({
    mutationFn: async (data: { type: 'analyzer' | 'mux'; ip: string; port?: number }) => {
      const response = await apiClient.post<TestConnectionResponse>('/devices/test-connection', data);
      return response.data;
    },
  });
};

export const useCreateScheduledJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduledJobDto) => createScheduledJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledJobs'] });
    },
  });
};
