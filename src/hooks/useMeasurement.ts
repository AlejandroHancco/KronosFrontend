import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  TaskDetail,
  TestConnectionResponse,
  MeasureResponse,
  MeasurementSummary,
  MeasurementDetail,
} from '../types/measurement.types';

export const useGetTask = (taskId: number) => {
  return useQuery<TaskDetail>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data;
    },
  });
};

export const useTestConnection = () => {
  return useMutation<
    TestConnectionResponse,
    Error,
    { type: 'analyzer' | 'mux'; ip: string; port?: number }
  >({
    mutationFn: async ({ type, ip, port = 3570 }) => {
      const response = await apiClient.post('/devices/test-connection', {
        type,
        ip,
        port,
      });
      return response.data;
    },
  });
};

export const useMeasure = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    MeasureResponse,
    Error,
    { startFreq: number; stopFreq: number; points: number; sweepType: string; selectedChannels: number[]; jobId?: string }
  >({
    mutationFn: async (params) => {
      const response = await apiClient.post(`/tasks/${taskId}/measure`, params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements', taskId] });
    },
  });
};

export const useGetMeasurements = (taskId: number) => {
  return useQuery<MeasurementSummary[]>({
    queryKey: ['measurements', taskId],
    queryFn: async () => {
      const response = await apiClient.get(`/tasks/${taskId}/measurements`);
      return response.data;
    },
  });
};

export const useGetMeasurementDetail = (id: number | null) => {
  return useQuery<MeasurementDetail>({
    queryKey: ['measurement', id],
    queryFn: async () => {
      const response = await apiClient.get(`/measurements/${id}`);
      return response.data;
    },
    enabled: id !== null,
  });
};
