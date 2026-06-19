import apiClient from './client';
import type { Task,  } from '../types';
import type {
  TaskPreferenceResponse,
  CreateTaskPreferenceDto,
  UpdateTaskPreferenceDto,
  CreateScheduledJobDto,
  ScheduledJobResponse,

} from '../types/measurement.types';
import type {CreateTaskDto} from "../types/task.types.ts";
import type {DeviceInfo} from "../types/device.types.ts";

export const getTasks = async (
    projectId: string,
    page: number = 1,
    limit: number = 10
): Promise<{ items: Task[]; total: number; page: number; limit: number }> => {
  const response = await apiClient.get(`/projects/${projectId}/tasks`, {
    params: { page, limit },
  });
  return response.data;
};

export const createTask = async (projectId: string, data: CreateTaskDto): Promise<Task> => {
  const response = await apiClient.post(`/projects/${projectId}/tasks`, { ...data, projectId });
  return response.data;
};

export const getProjectDevices = async (projectId: string): Promise<DeviceInfo[]> => {
  const response = await apiClient.get(`/projects/${projectId}/devices`);
  return response.data;
};

export const getTaskPreference = async (taskId: number): Promise<TaskPreferenceResponse | null> => {
  const response = await apiClient.get(`/tasks/${taskId}/preference`);
  return response.data;
};

export const createTaskPreference = async (taskId: number, data: CreateTaskPreferenceDto): Promise<TaskPreferenceResponse> => {
  const response = await apiClient.post(`/tasks/${taskId}/preference`, data);
  return response.data;
};

export const updateTaskPreference = async (taskId: number, data: UpdateTaskPreferenceDto): Promise<TaskPreferenceResponse> => {
  const response = await apiClient.put(`/tasks/${taskId}/preference`, data);
  return response.data;
};

export const createScheduledJob = async (data: CreateScheduledJobDto): Promise<ScheduledJobResponse> => {
  const response = await apiClient.post(`/scheduled-jobs`, data);
  return response.data;
};

export const getScheduledJobs = async (params: { projectId?: string; from: string; to: string }): Promise<ScheduledJobResponse[]> => {
  const response = await apiClient.get('/scheduled-jobs', { params });
  return response.data;
};
