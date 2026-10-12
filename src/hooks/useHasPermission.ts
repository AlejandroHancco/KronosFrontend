import { useAuth } from './useAuth';

export const useHasPermission = (permission: string): boolean => {
  const { user } = useAuth();
  return user?.permissions?.includes(permission) ?? false;
};
