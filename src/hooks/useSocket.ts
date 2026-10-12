import { useEffect } from 'react';
import { socket, refreshSocketAuth } from '../lib/socket';
import { useAuth } from './useAuth';

// Contador de consumidores activos: varios componentes pueden usar el hook
// a la vez sin que el unmount de uno desconecte el socket de los demás.
let consumers = 0;

export const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    consumers += 1;
    if (!socket.connected) {
      refreshSocketAuth();
      socket.connect();
    }

    return () => {
      consumers -= 1;
      if (consumers <= 0) {
        socket.disconnect();
      }
    };
  }, [user]);

  return socket;
};
