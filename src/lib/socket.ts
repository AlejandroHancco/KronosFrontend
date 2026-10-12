import { io } from 'socket.io-client';

// Socket singleton global (namespace raíz) para notificaciones,
// eventos de equipo y estado de jobs. El socket de mediciones
// (namespace /measurements) vive aparte en useWebSocket.
export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  auth: { token: localStorage.getItem('token') },
});

/** Refresca el token antes de (re)conectar — el objeto auth se lee en cada intento de conexión. */
export const refreshSocketAuth = () => {
  socket.auth = { token: localStorage.getItem('token') };
};
