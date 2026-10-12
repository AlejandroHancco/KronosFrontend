import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, getPermissions, updateRolePermissions } from '../api/permissions.api';

export const useGetRoles = () => useQuery({
  queryKey: ['roles'],
  queryFn: getRoles,
});

export const useGetPermissions = () => useQuery({
  queryKey: ['permissions'],
  queryFn: getPermissions,
});

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      updateRolePermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
