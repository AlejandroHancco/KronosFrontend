import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from './useSocket';

interface DeviceStatusPayload {
  deviceId: string;
  projectId: string;
  status: 'online' | 'offline';
}

/**
 * Escucha cambios de estado online/offline de dispositivos (emitidos por el health
 * check periódico del backend) e invalida las queries de devices para refrescar la UI.
 * Montar UNA sola vez (en PrivateLayout).
 */
export const useDeviceStatusListener = () => {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const handleDeviceStatus = (payload: DeviceStatusPayload) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', payload.projectId] });
    };

    socket.on('device:status', handleDeviceStatus);
    return () => {
      socket.off('device:status', handleDeviceStatus);
    };
  }, [socket, queryClient]);
};
