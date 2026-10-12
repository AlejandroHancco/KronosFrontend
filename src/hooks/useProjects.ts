import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, getProject, createProject, getProjectMembers, updateProjectMemberRole, addProjectMember, updateProjectMemberPermissions } from '../api/projects.api';
import type { Project, CreateProjectDto, ProjectMember } from '../types';
import apiClient from '../api/client';



export const useGetProjects = () => {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });
};

export const useGetProjectsCountByRole = (role: string) => {
  return useQuery({
    queryKey: ['projects', 'count', role],
    queryFn: async (): Promise<number> => {
      const { data } = await apiClient.get('/projects/count', {
        params: { role },
      });
      return data;
    },
    enabled: !!role,
  });
};

export const useGetProject = (id: string) => {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => createProject(data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${newProject.uuid}`);
    },
  });
};

export const useGetProjectMembers = (projectId: string) => {
  return useQuery<ProjectMember[]>({
    queryKey: ['project-members', projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });
};

export const useUpdateProjectMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, roleId }: { projectId: string; userId: string; roleId: number }) =>
      updateProjectMemberRole(projectId, userId, roleId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, roleId }: { projectId: string; userId: string; roleId: number }) =>
      addProjectMember(projectId, userId, roleId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useUpdateProjectMemberPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId, permissions }: { projectId: string; userId: string; permissions: string[] }) =>
      updateProjectMemberPermissions(projectId, userId, permissions),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};
