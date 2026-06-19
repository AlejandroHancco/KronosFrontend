import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import type {
  MeasurementSocketState,
  ProgressEvent,
  CompletedEvent,
  ErrorEvent,
} from '../types/measurement.types';

export const useMeasurementSocket = (
  socket: Socket | null,
  jobId: string | null
): MeasurementSocketState => {
  const [state, setState] = useState<MeasurementSocketState>({
    progress: 0,
    currentChannel: 0,
    statusMessage: '',
    isCompleted: false,
    completedData: null,
    error: null,
  });

  useEffect(() => {
    // Si no hay socket o jobId, no hacer nada
    if (!socket || !jobId) {
      return;
    }

    // Handler para progreso
    const handleProgress = (data: ProgressEvent) => {
      if (data.jobId === jobId) {
        setState((prev) => ({
          ...prev,
          progress: data.percent,
          currentChannel: data.channel,
          statusMessage: `Midiendo canal ${data.channel} de ${data.total}...`,
          error: null,
        }));
      }
    };

    // Handler para medición completada
    const handleCompleted = (data: CompletedEvent) => {
      if (data.jobId === jobId) {
        setState((prev) => ({
          ...prev,
          progress: 100,
          isCompleted: true,
          completedData: data.data,
          statusMessage: `Medición completada: ${data.totalPoints} puntos`,
          error: null,
        }));
      }
    };

    // Handler para errores
    const handleError = (data: ErrorEvent) => {
      if (data.jobId === jobId) {
        setState((prev) => ({
          ...prev,
          error: data.message,
          statusMessage: `Error: ${data.message}`,
        }));
      }
    };

    // Registrar listeners
    socket.on('measurement:progress', handleProgress);
    socket.on('measurement:completed', handleCompleted);
    socket.on('measurement:error', handleError);

    // Cleanup: remover listeners cuando se desmonta o cambia jobId
    return () => {
      socket.off('measurement:progress', handleProgress);
      socket.off('measurement:completed', handleCompleted);
      socket.off('measurement:error', handleError);
    };
  }, [socket, jobId]);

  return state;
};


