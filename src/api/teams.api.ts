import apiClient from './client';
import type { Team, TeamMember, TeamProject, TeamActivity } from '../types';

export const getCurrentTeam = async (): Promise<Team> => {
  const response = await apiClient.get('/teams');
  return response.data;
};

export const getTeam = async (teamId: string): Promise<Team> => {
  const response = await apiClient.get(`/teams/${teamId}`);
  return response.data;
};

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const response = await apiClient.get(`/teams/${teamId}/members`);
  return response.data;
};

export const updateTeamMemberRole = async (
  teamId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER'
): Promise<TeamMember> => {
  const response = await apiClient.patch(`/teams/${teamId}/members/${userId}/role`, { role });
  return response.data;
};

export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<void> => {
  const response = await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const approveTeamMember = async (
  _teamId: string,
  userId: string
): Promise<TeamMember> => {
  const response = await apiClient.patch(`/teams/requests/${userId}/approve`);
  return response.data;
};

export const rejectTeamMember = async (
  _teamId: string,
  userId: string
): Promise<TeamMember> => {
  const response = await apiClient.patch(`/teams/requests/${userId}/reject`);
  return response.data;
};

export const getTeamProjects = async (teamId: string): Promise<TeamProject[]> => {
  const response = await apiClient.get(`/teams/${teamId}/projects`);
  return response.data;
};

export const getTeamActivity = async (teamId: string): Promise<TeamActivity[]> => {
  const response = await apiClient.get(`/teams/${teamId}/activity`);
  return response.data;
};

export const joinTeam = async (code: string): Promise<{ message?: string }> => {
  const response = await apiClient.post('/teams/join', { code });
  return response.data;
};

export const getMyTeamStatus = async (): Promise<{ status: string; rejectionCount?: number }> => {
  const response = await apiClient.get('/teams/my-status');
  return response.data;
};

export const getPendingTeamRequests = async (teamId: string): Promise<TeamMember[]> => {
  const response = await apiClient.get(`/teams/${teamId}/members/pending`);
  return response.data;
};

export const approveTeamRequest = async (userId: string): Promise<TeamMember> => {
  const response = await apiClient.patch(`/teams/requests/${userId}/approve`);
  return response.data;
};

export const rejectTeamRequest = async (userId: string): Promise<TeamMember> => {
  const response = await apiClient.patch(`/teams/requests/${userId}/reject`);
  return response.data;
};

