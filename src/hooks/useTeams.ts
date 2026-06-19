import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentTeam,
  getTeam,
  getTeamMembers,
  updateTeamMemberRole,
  removeTeamMember,
  approveTeamMember,
  rejectTeamMember,
  getTeamProjects,
  getTeamActivity,
  joinTeam,
  getMyTeamStatus,
  getPendingTeamRequests,
  approveTeamRequest,
  rejectTeamRequest,
} from '../api/teams.api';
import type { Team, TeamMember, TeamProject, TeamActivity } from '../types';

export const useGetTeam = (teamId: string) => {
  return useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: () => getTeam(teamId),
    enabled: !!teamId,
  });
};

export const useGetTeamMembers = (teamId: string) => {
  return useQuery<TeamMember[]>({
    queryKey: ['team-members', teamId],
    queryFn: () => getTeamMembers(teamId),
    enabled: !!teamId,
  });
};

export const useUpdateTeamMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      teamId,
      userId,
      role,
    }: {
      teamId: string;
      userId: string;
      role: 'ADMIN' | 'MEMBER';
    }) => updateTeamMemberRole(teamId, userId, role),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
    },
  });
};

export const useApproveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      approveTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['pending-team-requests', teamId] });
    },
  });
};

export const useRejectTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      rejectTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
      queryClient.invalidateQueries({ queryKey: ['pending-team-requests', teamId] });
    },
  });
};

export const useApproveTeamRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => approveTeamRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-status'] });
    },
  });
};

export const useRejectTeamRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => rejectTeamRequest(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-team-requests'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-status'] });
    },
  });
};

export const useGetTeamProjects = (teamId: string) => {
  return useQuery<TeamProject[]>({
    queryKey: ['team-projects', teamId],
    queryFn: () => getTeamProjects(teamId),
    enabled: !!teamId,
  });
};

export const useGetTeamActivity = (teamId: string) => {
  return useQuery<TeamActivity[]>({
    queryKey: ['team-activity', teamId],
    queryFn: () => getTeamActivity(teamId),
    enabled: !!teamId,
  });
};

export const useGetCurrentTeam = () => {
  return useQuery<Team>({
    queryKey: ['current-team'],
    queryFn: getCurrentTeam,
    retry: 1,
  });
};

export const useJoinTeam = () => {
  return useMutation({
    mutationFn: (code: string) => joinTeam(code),
  });
};

export const useGetMyTeamStatus = () => {
  return useQuery<{ status: string; rejectionCount?: number }>({
    queryKey: ['team-status'],
    queryFn: getMyTeamStatus,
    refetchInterval: 30000,
    retry: false,
  });
};

export const useGetPendingTeamRequests = (teamId: string) => {
  return useQuery({
    queryKey: ['pending-team-requests', teamId],
    queryFn: () => getPendingTeamRequests(teamId),
    enabled: !!teamId,
    refetchInterval: 10000,
  });
};
