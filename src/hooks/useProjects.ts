import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getProjects, getProject, createProject } from '../api/projects.api';
import type { Project, CreateProjectDto } from '../types';
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
