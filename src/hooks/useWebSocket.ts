import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Solo crear conexión si el usuario está autenticado
    if (!user?.id) {
      return;
    }

    // Obtener URL base del backend desde variables de entorno
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Crear conexión socket.io
    const newSocket = io(`${backendUrl}/measurements`, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      auth: {
        userId: user.id,
      },
    });

    // Event listeners
    newSocket.on('connect', () => {
      setIsConnected(true);
      // Unirse a la sala personal del usuario
      newSocket.emit('join', user.id);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    setSocket(newSocket);

    // Cleanup: desconectar cuando se desmonta el componente
    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.disconnect();
    };
  }, [user?.id]);

  return { socket, isConnected };
};
