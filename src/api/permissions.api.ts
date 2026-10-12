import apiClient from './client';
import type { Role, Permission } from '../types/permissions';

export const getRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get('/roles');
  return response.data;
};

export const getPermissions = async (): Promise<Permission[]> => {
  const response = await apiClient.get('/permissions');
  return response.data;
};

export const updateRolePermissions = async (
  roleId: number,
  permissions: string[]
): Promise<void> => {
  await apiClient.patch(`/roles/${roleId}/permissions`, { permissions });
};
