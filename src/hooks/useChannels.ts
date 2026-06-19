import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { TaskChannelInfo, MeasurementChannelInfo } from '../types/measurement.types';

export const useGetTaskChannels = (taskId: number) => {
  return useQuery<TaskChannelInfo[]>({
    queryKey: ['taskChannels', taskId],
    queryFn: () => apiClient.get(`/tasks/${taskId}/channels`).then(res => res.data),
  });
};

export const useUpdateTaskChannel = (taskId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { channelNumber: number; body: Partial<Pick<TaskChannelInfo, 'alias' | 'concreteMix' | 'hasEmulsifier' | 'notes' | 'sampleAge' | 'temperature' | 'humidity'>> }
  >({
    mutationFn: ({ channelNumber, body }) =>
      apiClient.put(`/tasks/${taskId}/channels/${channelNumber}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskChannels', taskId] });
    },
  });
};

export const useGetMeasurementChannels = (measurementId: number | null) => {
  return useQuery<MeasurementChannelInfo[]>({
    queryKey: ['measurementChannels', measurementId],
    queryFn: () => apiClient.get(`/measurements/${measurementId}/channels`).then(res => res.data),
    enabled: measurementId !== null,
  });
};

export const useUpdateMeasurementChannel = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { measurementId: number; channelNumber: number; data: Partial<Pick<MeasurementChannelInfo, 'concreteMix' | 'hasEmulsifier' | 'notes' | 'sampleAge' | 'temperature' | 'humidity'>> }
  >({
    mutationFn: ({ measurementId, channelNumber, data }) =>
      apiClient.patch(`/measurements/${measurementId}/channels/${channelNumber}`, data),
    onSuccess: (_, { measurementId }) => {
      queryClient.invalidateQueries({ queryKey: ['measurementChannels', measurementId] });
    },
  });
};
