import axios from 'axios';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rutas públicas: no requieren token y un 401 ahí es "credenciales inválidas",
// no "sesión expirada" — no deben disparar la redirección global.
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/check-email'];
const isPublicRoute = (url?: string) => PUBLIC_ROUTES.some((route) => url?.includes(route));

const getAuthToken = async (): Promise<string | null> => {
  // Primero intenta JWT propio
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Si no hay JWT propio, intenta token de Supabase
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;
  
  return null;
};

// Interceptor para agregar el token JWT
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isPublicRoute(config.url)) {
      // Solo redirigir si no hay token Y la ruta no es pública
      window.location.href = '/login';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: mensajes claros para errores comunes.
// Dedupe simple para no repetir el mismo toast en ráfaga (retries, refetch).
let lastToast = { message: '', at: 0 };
const toastOnce = (message: string) => {
  const now = Date.now();
  if (lastToast.message === message && now - lastToast.at < 5000) return;
  lastToast = { message, at: now };
  toast.error(message);
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 && !isPublicRoute(error?.config?.url)) {
      // Token inválido/expirado en una ruta protegida: no es un error de la
      // página, es que la sesión ya no sirve. Limpiamos y mandamos a loguear.
      localStorage.removeItem('token');
      toastOnce('Tu sesión expiró. Vuelve a iniciar sesión.');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toastOnce('No tienes permiso para realizar esta acción');
    } else if (status >= 500) {
      toastOnce('Error del servidor, intenta de nuevo');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
