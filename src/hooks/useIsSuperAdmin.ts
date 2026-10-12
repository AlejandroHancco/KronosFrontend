import { useAuth } from './useAuth';

export const useIsSuperAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.roleNames?.includes('Super Administrador') ?? false;
};
