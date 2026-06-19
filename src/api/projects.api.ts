import apiClient from './client';
import type { Project, CreateProjectDto } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data: CreateProjectDto): Promise<Project> => {
  const response = await apiClient.post('/projects', data);
  return response.data;
};
