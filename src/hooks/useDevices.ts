import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {  CreateDeviceDto, TestConnectionResponse } from '../types/measurement.types';
import type {DeviceResponse} from "../types/device.types.ts";

export const useGetAllDevices = () => {
  return useQuery<DeviceResponse[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await apiClient.get('/devices');
      return response.data;
    },
  });
};

export const useGetProjectDevices = (projectId: string | undefined) => {
  return useQuery<DeviceResponse[]>({
    queryKey: ['devices', projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${projectId}/devices`);
      return response.data;
    },
    enabled: !!projectId,
  });
};

export const useCreateDevice = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<DeviceResponse, Error, CreateDeviceDto>({
    mutationFn: async (data) => {
      const response = await apiClient.post(`/projects/${projectId}/devices`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', projectId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useUpdateDevice = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<DeviceResponse, Error, { id: string; data: Partial<CreateDeviceDto> }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/projects/${projectId}/devices/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', projectId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useDeleteDevice = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/projects/${projectId}/devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', projectId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useUpdateDeviceStatus = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<DeviceResponse, Error, { id: string; status: 'archived' | 'unchecked' }>({
    mutationFn: async ({ id, status }) => {
      const response = await apiClient.patch(`/projects/${projectId}/devices/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices', projectId] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
};

export const useTestDeviceConnection = () => {
  return useMutation<TestConnectionResponse, Error, { type: 'analyzer' | 'mux'; ip: string; port?: number }>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/devices/test-connection', data);
      return response.data;
    },
  });
};