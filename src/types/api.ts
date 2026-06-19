/**
 * Interfaz global para respuestas de error de la API
 * Compatible con el formato estándar de NestJS
 */
export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

/**
 * Utilidad para extraer el mensaje de error de una respuesta
 * Si es un array, toma el primer elemento
 */
export const getErrorMessage = (errorResponse: ApiErrorResponse | unknown): string => {
  if (typeof errorResponse === 'object' && errorResponse !== null) {
    const err = errorResponse as ApiErrorResponse;
    if (err.message) {
      if (Array.isArray(err.message)) {
        return err.message[0] || 'Error desconocido';
      }
      return err.message;
    }
  }
  return 'Error desconocido';
};

