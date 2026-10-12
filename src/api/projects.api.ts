import apiClient from './client';
import type { Project, CreateProjectDto, ProjectMember } from '../types';

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

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await apiClient.get(`/projects/${projectId}/members`);
  return response.data;
};

export const updateProjectMemberRole = async (
  projectId: string,
  userId: string,
  roleId: number
): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/members/${userId}/role`, { roleId });
};

export const addProjectMember = async (
  projectId: string,
  userId: string,
  roleId: number
): Promise<void> => {
  await apiClient.post(`/projects/${projectId}/members`, { userId, roleId });
};

export const updateProjectMemberPermissions = async (
  projectId: string,
  userId: string,
  permissions: string[]
): Promise<void> => {
  await apiClient.patch(`/projects/${projectId}/members/${userId}/permissions`, { permissions });
};
